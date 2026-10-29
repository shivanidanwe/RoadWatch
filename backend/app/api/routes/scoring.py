from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
import json

from backend.app.database import db
from backend.app.models.schemas import ScoringConfigUpdate, ScoringConfigResponse
from backend.app.recommendation.engine import RecommendationEngine
from backend.data.seed_data import recalculate_all_recommendations

router = APIRouter(prefix="/scoring", tags=["Scoring Configuration"])

@router.get("/config", response_model=ScoringConfigResponse)
def get_scoring_config():
    """
    Returns active factor weights, operational risk threshold bands, and audit metadata.
    """
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM scoring_configs WHERE is_active = 1 ORDER BY updated_at DESC LIMIT 1")
        cfg = cursor.fetchone()
        cursor.execute("SELECT COUNT(*) as cnt FROM audit_logs")
        audit_cnt = cursor.fetchone()["cnt"]

    if not cfg:
        raise HTTPException(status_code=404, detail="Active scoring configuration not found.")

    weights = {
        "damage_severity": cfg["damage_severity"],
        "recent_report_frequency": cfg["recent_report_frequency"],
        "traffic_intensity": cfg["traffic_intensity"],
        "weather_exposure": cfg["weather_exposure"],
        "time_since_last_repair": cfg["time_since_last_repair"],
        "historical_deterioration": cfg["historical_deterioration"],
    }

    thresholds = {
        "critical_min": cfg["critical_min"],
        "high_min": cfg["high_min"],
        "medium_min": cfg["medium_min"],
        "low_min": cfg["low_min"],
    }

    return ScoringConfigResponse(
        version=cfg["version"],
        active_weights=weights,
        thresholds=thresholds,
        last_updated=cfg["updated_at"],
        updated_by=cfg["updated_by"],
        audit_history_count=audit_cnt
    )

@router.patch("/config", response_model=ScoringConfigResponse)
def update_scoring_config(payload: ScoringConfigUpdate):
    """
    Allows authorized administrators to update scoring weights and risk thresholds.
    Validates non-negativity and sums to 1.0, records audit log, and recalculates road priorities.
    """
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM scoring_configs WHERE is_active = 1 ORDER BY updated_at DESC LIMIT 1")
        curr = cursor.fetchone()

        if not curr:
            raise HTTPException(status_code=500, detail="Base scoring configuration missing.")

        # Update weights if supplied
        dmg = payload.damage_severity if payload.damage_severity is not None else curr["damage_severity"]
        rep_freq = payload.recent_report_frequency if payload.recent_report_frequency is not None else curr["recent_report_frequency"]
        trf = payload.traffic_intensity if payload.traffic_intensity is not None else curr["traffic_intensity"]
        wth = payload.weather_exposure if payload.weather_exposure is not None else curr["weather_exposure"]
        maint = payload.time_since_last_repair if payload.time_since_last_repair is not None else curr["time_since_last_repair"]
        det = payload.historical_deterioration if payload.historical_deterioration is not None else curr["historical_deterioration"]

        # Validate non-negativity
        if min(dmg, rep_freq, trf, wth, maint, det) < 0.0:
            raise HTTPException(status_code=400, detail="All scoring weights must be non-negative.")

        total = dmg + rep_freq + trf + wth + maint + det
        if total <= 0:
            raise HTTPException(status_code=400, detail="Sum of active weights must be greater than zero.")

        # Normalize weights to sum to 1.0
        norm_weights = {
            "damage_severity": round(dmg / total, 4),
            "recent_report_frequency": round(rep_freq / total, 4),
            "traffic_intensity": round(trf / total, 4),
            "weather_exposure": round(wth / total, 4),
            "time_since_last_repair": round(maint / total, 4),
            "historical_deterioration": round(det / total, 4),
        }

        # Thresholds
        crit = payload.critical_min if payload.critical_min is not None else curr["critical_min"]
        high = payload.high_min if payload.high_min is not None else curr["high_min"]
        med = payload.medium_min if payload.medium_min is not None else curr["medium_min"]
        low = payload.low_min if payload.low_min is not None else curr["low_min"]

        if not (0.0 <= low <= med <= high <= crit <= 100.0):
            raise HTTPException(status_code=400, detail="Thresholds must satisfy: 0 <= low <= med <= high <= crit <= 100.")

        now_str = datetime.now().isoformat()
        new_version = f"v2.4-Config-{datetime.now().strftime('%Y%m%d%H%M%S')}"

        # Deactivate old config
        cursor.execute("UPDATE scoring_configs SET is_active = 0 WHERE is_active = 1")

        # Insert new configuration
        cursor.execute("""
        INSERT INTO scoring_configs (
            version, damage_severity, recent_report_frequency, traffic_intensity,
            weather_exposure, time_since_last_repair, historical_deterioration,
            critical_min, high_min, medium_min, low_min, updated_by, updated_at, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            new_version,
            norm_weights["damage_severity"],
            norm_weights["recent_report_frequency"],
            norm_weights["traffic_intensity"],
            norm_weights["weather_exposure"],
            norm_weights["time_since_last_repair"],
            norm_weights["historical_deterioration"],
            crit, high, med, low,
            payload.updated_by or "Municipal Administrator",
            now_str
        ))

        # Insert Audit Log
        audit_id = f"AUD-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        cursor.execute("""
        INSERT INTO audit_logs (id, timestamp, user, action, details)
        VALUES (?, ?, ?, ?, ?)
        """, (
            audit_id,
            now_str,
            payload.updated_by or "Administrator",
            "UPDATE_SCORING_WEIGHTS",
            f"Config calibrated to {new_version}. Reason: {payload.reason or 'User action'}"
        ))

        conn.commit()

    # Recalculate all road rankings with new scoring configuration
    recalculate_all_recommendations()

    return get_scoring_config()
