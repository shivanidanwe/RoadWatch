from fastapi import APIRouter, Query, HTTPException, Depends
from typing import Optional, List
import json
import pandas as pd
from datetime import datetime

from backend.app.database import db
from backend.app.models.schemas import PaginatedRecommendations, RoadUrgencyRecommendation, FactorDetail, RecommendationExplanation
from backend.app.recommendation.engine import RecommendationEngine
from backend.app.ml.feature_engineering import FeatureEngineer
from backend.app.ml.inference import ModelInference
from backend.app.config import config

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("", response_model=PaginatedRecommendations)
def get_recommendations(
    category: Optional[str] = Query(None, description="Filter by risk category: Critical, High, Medium, Low"),
    road_type: Optional[str] = Query(None, description="Filter by road type: Arterial, Sub-Arterial, Collector, Local Access"),
    ward: Optional[str] = Query(None, description="Filter by ward substring"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
):
    """
    Ranks municipal road sections by maintenance urgency with transparent factor scoring and explanations.
    Deterministic tie-breaking:
    1. Urgency score (descending)
    2. Damage severity score (descending)
    3. Traffic intensity score (descending)
    4. Segment ID (alphabetical ascending)
    """
    engine = RecommendationEngine()
    fe = FeatureEngineer()
    inference = ModelInference()

    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM road_segments")
        rows = [dict(r) for r in cursor.fetchall()]

    if not rows:
        return PaginatedRecommendations(
            total=0, page=page, page_size=page_size, total_pages=1,
            active_weights=engine.weights.normalized(),
            thresholds={
                "critical_min": engine.thresholds.critical_min,
                "high_min": engine.thresholds.high_min,
                "medium_min": engine.thresholds.medium_min,
                "low_min": engine.thresholds.low_min,
            },
            items=[]
        )

    roads_df = pd.DataFrame(rows)
    roads_df["last_maintenance_dt"] = pd.to_datetime(roads_df["last_maintenance_date"], errors="coerce")
    roads_df["last_inspection_dt"] = pd.to_datetime(roads_df["last_inspection_date"], errors="coerce")
    featured = fe.engineer_features(roads_df)

    evaluations: List[RoadUrgencyRecommendation] = []
    for _, row in featured.iterrows():
        f_dict = row.to_dict()
        pred_risk, conf, mod_ver, is_model = inference.predict_segment(f_dict)
        rec = engine.evaluate_segment(f_dict, predicted_risk=pred_risk, model_confidence=conf, model_version=mod_ver)
        evaluations.append(rec)

    paginated = engine.rank_segments(
        evaluations,
        category_filter=category,
        road_type_filter=road_type,
        ward_filter=ward,
        page=page,
        page_size=page_size
    )
    return paginated

@router.get("/{road_segment_id}", response_model=RoadUrgencyRecommendation)
def get_recommendation_by_id(road_segment_id: str):
    """
    Retrieves urgency ranking, factor score breakdown, and engineering explanation for a specific road section.
    """
    engine = RecommendationEngine()
    fe = FeatureEngineer()
    inference = ModelInference()

    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM road_segments WHERE id = ?", (road_segment_id,))
        row = cursor.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail=f"Road segment '{road_segment_id}' not found.")

    roads_df = pd.DataFrame([dict(row)])
    roads_df["last_maintenance_dt"] = pd.to_datetime(roads_df["last_maintenance_date"], errors="coerce")
    roads_df["last_inspection_dt"] = pd.to_datetime(roads_df["last_inspection_date"], errors="coerce")
    featured = fe.engineer_features(roads_df)

    f_dict = featured.iloc[0].to_dict()
    pred_risk, conf, mod_ver, is_model = inference.predict_segment(f_dict)
    rec = engine.evaluate_segment(f_dict, predicted_risk=pred_risk, model_confidence=conf, model_version=mod_ver)
    return rec
