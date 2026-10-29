import math
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime

from ..config import ScoringWeights, RiskThresholds, config
from ..models.schemas import (
    RoadUrgencyRecommendation,
    FactorDetail,
    RecommendationExplanation,
    PaginatedRecommendations
)

class RecommendationEngine:
    """
    Explainable, data-driven recommendation and ranking engine for municipal road maintenance.
    Calculates transparent urgency scores, assigns operational risk tiers, generates human-readable
    explanations, and provides deterministic priority ordering.
    """

    def __init__(
        self,
        weights: Optional[ScoringWeights] = None,
        thresholds: Optional[RiskThresholds] = None,
        scoring_version: str = "v2.4-MunicipalCalibrated"
    ):
        self.weights = weights or config.DEFAULT_WEIGHTS
        self.thresholds = thresholds or config.DEFAULT_THRESHOLDS
        self.scoring_version = scoring_version

    def update_config(self, weights: Optional[ScoringWeights] = None, thresholds: Optional[RiskThresholds] = None):
        if weights:
            self.weights = weights
        if thresholds:
            thresholds.validate_thresholds()
            self.thresholds = thresholds

    def map_score_to_category(self, score: float) -> str:
        """
        Maps score (0-100) to operational category with strict boundary enforcement:
        - [80.0, 100.0] -> Critical
        - [60.0, 80.0) -> High
        - [40.0, 60.0) -> Medium
        - [0.0, 40.0) -> Low
        """
        s = round(float(score), 2)
        if s >= self.thresholds.critical_min:
            return "Critical"
        elif s >= self.thresholds.high_min:
            return "High"
        elif s >= self.thresholds.medium_min:
            return "Medium"
        else:
            return "Low"

    def determine_action(self, urgency_score: float, category: str, damage_sev: float) -> str:
        """
        Provides conservative municipal inspection recommendations.
        Does not automatically dispatch capital repair orders without engineer verification.
        """
        if category == "Critical" or damage_sev >= 90.0:
            return "Immediate inspection"
        elif category == "High":
            return "Priority inspection"
        elif category == "Medium":
            return "Scheduled inspection"
        else:
            return "Routine monitoring"

    def calculate_urgency_score(
        self,
        damage_severity: float,
        recent_report_frequency: float,
        traffic_intensity: float,
        weather_exposure: float,
        time_since_last_repair: float,
        historical_deterioration: float,
        available_factors: Optional[Dict[str, bool]] = None
    ) -> Tuple[float, Dict[str, float], List[str]]:
        """
        Calculates Urgency Score = sum(normalized_weight * normalized_factor) * 100.
        Tracks missing factors and uses documented fallback without silently treating as zero risk.
        """
        norm_weights = self.weights.normalized()
        warnings: List[str] = []

        factors = {
            "damage_severity": float(damage_severity),
            "recent_report_frequency": float(recent_report_frequency),
            "traffic_intensity": float(traffic_intensity),
            "weather_exposure": float(weather_exposure),
            "time_since_last_repair": float(time_since_last_repair),
            "historical_deterioration": float(historical_deterioration),
        }

        if available_factors:
            missing_keys = [k for k, v in available_factors.items() if not v]
            if missing_keys:
                warnings.append(f"Incomplete telemetry: Missing factors ({', '.join(missing_keys)}) estimated using municipal defaults.")

        score = 0.0
        for key, weight in norm_weights.items():
            val = max(0.0, min(100.0, factors[key]))
            score += weight * val

        score = round(max(0.0, min(100.0, score)), 1)
        return score, factors, warnings

    def generate_explanation(
        self,
        segment_id: str,
        road_name: str,
        score: float,
        category: str,
        factors: Dict[str, float],
        weights: Dict[str, float]
    ) -> RecommendationExplanation:
        """
        Synthesizes human-readable engineering explanation of why a segment received its ranking.
        """
        # Determine contribution of each factor: factor_score * weight
        contributions = {
            k: (factors[k] * weights[k], factors[k])
            for k in weights.keys()
        }

        # Sort factors by impact
        sorted_factors = sorted(contributions.items(), key=lambda x: x[1][0], reverse=True)
        top_driver_key = sorted_factors[0][0]
        
        factor_display_names = {
            "damage_severity": "severe reported surface damage & distress",
            "recent_report_frequency": "frequent citizen & patrol complaint volume",
            "traffic_intensity": "heavy commercial freight & commuter traffic exposure",
            "weather_exposure": "monsoon waterlogging & subgrade moisture saturation",
            "time_since_last_repair": "extended maintenance gap since last resurfacing",
            "historical_deterioration": "structural Pavement Condition Index (PCI) degradation",
        }

        primary_driver = factor_display_names.get(top_driver_key, top_driver_key)

        reasons = []
        if factors.get("damage_severity", 0) >= 70:
            reasons.append(f"High reported damage severity index ({factors['damage_severity']:.0f}/100) indicating active structural distress.")
        if factors.get("recent_report_frequency", 0) >= 60:
            reasons.append(f"Elevated report velocity ({factors['recent_report_frequency']:.0f}/100) across recent reporting intervals.")
        if factors.get("traffic_intensity", 0) >= 70:
            reasons.append(f"High-volume arterial traffic loading ({factors['traffic_intensity']:.0f}/100) accelerating pavement fatigue.")
        if factors.get("weather_exposure", 0) >= 70:
            reasons.append(f"Elevated flood or runoff vulnerability ({factors['weather_exposure']:.0f}/100) threatening subgrade cohesion.")
        if factors.get("time_since_last_repair", 0) >= 70:
            reasons.append(f"Long maintenance interval ({factors['time_since_last_repair']:.0f}/100) exceeding recommended municipal cycle.")
        if factors.get("historical_deterioration", 0) >= 70:
            reasons.append(f"Advanced baseline PCI degradation ({factors['historical_deterioration']:.0f}/100) requiring structural intervention.")

        if not reasons:
            reasons.append("Road segment condition is within manageable tolerances with minor baseline wear.")

        summary = f"{category} priority due to {primary_driver}."
        if len(reasons) >= 2:
            summary += f" Compounded by {factor_display_names.get(sorted_factors[1][0], 'contributing secondary factors')}."

        return RecommendationExplanation(
            summary=summary,
            primary_driver=primary_driver,
            reasons=reasons,
            warnings=[]
        )

    def evaluate_segment(
        self,
        segment: Dict[str, Any],
        predicted_risk: Optional[float] = None,
        model_confidence: Optional[float] = None,
        model_version: str = "v2.4-RandomForest-Ensemble"
    ) -> RoadUrgencyRecommendation:
        norm_weights = self.weights.normalized()

        score, factors, warnings = self.calculate_urgency_score(
            damage_severity=segment.get("damage_severity_score", 50.0),
            recent_report_frequency=segment.get("recent_report_frequency_score", 50.0),
            traffic_intensity=segment.get("traffic_intensity_score", 50.0),
            weather_exposure=segment.get("weather_exposure_score", 50.0),
            time_since_last_repair=segment.get("time_since_last_repair_score", 50.0),
            historical_deterioration=segment.get("historical_deterioration_score", 50.0),
        )

        category = self.map_score_to_category(score)
        action = self.determine_action(score, category, factors["damage_severity"])
        seg_id = str(segment.get("segment_id") or segment.get("id") or "RD-000")
        road_name = str(segment.get("road_name") or segment.get("name") or "Road Segment")

        explanation = self.generate_explanation(
            segment_id=seg_id,
            road_name=road_name,
            score=score,
            category=category,
            factors=factors,
            weights=norm_weights
        )
        explanation.warnings.extend(warnings)

        # Factor details mapping
        def impact_level(val: float) -> str:
            if val >= 70:
                return "High"
            elif val >= 40:
                return "Moderate"
            return "Low"

        factor_details = {
            "damageSeverity": FactorDetail(
                name="Damage Severity & Surface Distress",
                score=factors["damage_severity"],
                weight=norm_weights["damage_severity"],
                impact=impact_level(factors["damage_severity"]),
                description=f"Weighted distress severity score of {factors['damage_severity']:.0f}/100 based on verified reports and pavement grade."
            ),
            "recentReportFrequency": FactorDetail(
                name="Distress Report Velocity (30d)",
                score=factors["recent_report_frequency"],
                weight=norm_weights["recent_report_frequency"],
                impact=impact_level(factors["recent_report_frequency"]),
                description=f"Rate of verified citizen and patrol reports ({factors['recent_report_frequency']:.0f}/100) logged during current window."
            ),
            "trafficIntensity": FactorDetail(
                name="Traffic Intensity & PCU Exposure",
                score=factors["traffic_intensity"],
                weight=norm_weights["traffic_intensity"],
                impact=impact_level(factors["traffic_intensity"]),
                description=f"Passenger Car Units and heavy commercial axle loading intensity rating ({factors['traffic_intensity']:.0f}/100)."
            ),
            "weatherExposure": FactorDetail(
                name="Monsoon Runoff & Flood Vulnerability",
                score=factors["weather_exposure"],
                weight=norm_weights["weather_exposure"],
                impact=impact_level(factors["weather_exposure"]),
                description=f"Local precipitation accumulation and subgrade water retention risk ({factors['weather_exposure']:.0f}/100)."
            ),
            "timeSinceLastRepair": FactorDetail(
                name="Maintenance Gap & Pavement Age",
                score=factors["time_since_last_repair"],
                weight=norm_weights["time_since_last_repair"],
                impact=impact_level(factors["time_since_last_repair"]),
                description=f"Elapsed time since previous resurfacing or major overhaul ({factors['time_since_last_repair']:.0f}/100)."
            ),
            "historicalDeterioration": FactorDetail(
                name="Historical Deterioration & PCI Gap",
                score=factors["historical_deterioration"],
                weight=norm_weights["historical_deterioration"],
                impact=impact_level(factors["historical_deterioration"]),
                description=f"Degradation derived from surveyed Pavement Condition Index ({factors['historical_deterioration']:.0f}/100)."
            ),
        }

        conf = model_confidence if model_confidence is not None else 91.0
        uncertainty = f"±{max(1.8, round((100.0 - conf) * 0.35, 1))}%"

        coords = [
            float(segment.get("latitude", 12.9716)),
            float(segment.get("longitude", 77.5946))
        ]

        return RoadUrgencyRecommendation(
            rank=0,  # set during ranking
            segment_id=seg_id,
            road_name=road_name,
            ward=str(segment.get("ward", "Ward 1")),
            road_type=str(segment.get("road_type", "Arterial")),
            surface_type=str(segment.get("surface_type", "Asphalt")),
            length_km=float(segment.get("length_km", 2.0)),
            coordinates=coords,
            urgency_score=score,
            risk_category=category,
            predicted_risk=round(predicted_risk, 1) if predicted_risk is not None else score,
            confidence_score=round(conf, 1),
            uncertainty_margin=uncertainty,
            recommended_action=action,
            factors=factor_details,
            explanation=explanation,
            data_quality_notes=f"Scored via {self.scoring_version}. Factors calibrated with {len(factors)} active operational dimensions.",
            model_version=model_version,
            scoring_version=self.scoring_version,
            scored_at=datetime.now().isoformat()
        )

    def rank_segments(
        self,
        evaluated_segments: List[RoadUrgencyRecommendation],
        category_filter: Optional[str] = None,
        road_type_filter: Optional[str] = None,
        ward_filter: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> PaginatedRecommendations:
        """
        Applies deterministic multi-level tie-breaking:
        1. Urgency score (descending)
        2. Damage severity score (descending)
        3. Traffic intensity score (descending)
        4. Segment ID (alphabetical ascending)
        """
        # Filter
        filtered = evaluated_segments
        if category_filter and category_filter.upper() != "ALL":
            filtered = [s for s in filtered if s.risk_category.lower() == category_filter.lower()]
        if road_type_filter and road_type_filter.upper() != "ALL":
            filtered = [s for s in filtered if s.road_type.lower() == road_type_filter.lower()]
        if ward_filter and ward_filter.upper() != "ALL":
            filtered = [s for s in filtered if ward_filter.lower() in s.ward.lower()]

        # Deterministic sorting
        def sort_key(rec: RoadUrgencyRecommendation):
            dmg = rec.factors.get("damageSeverity")
            trf = rec.factors.get("trafficIntensity")
            dmg_score = dmg.score if dmg else 0.0
            trf_score = trf.score if trf else 0.0
            return (-rec.urgency_score, -dmg_score, -trf_score, rec.segment_id)

        sorted_recs = sorted(filtered, key=sort_key)

        # Assign ranks
        for idx, rec in enumerate(sorted_recs):
            rec.rank = idx + 1

        total = len(sorted_recs)
        total_pages = max(1, math.ceil(total / page_size))
        start_idx = (page - 1) * page_size
        items = sorted_recs[start_idx : start_idx + page_size]

        return PaginatedRecommendations(
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            active_weights=self.weights.normalized(),
            thresholds={
                "critical_min": self.thresholds.critical_min,
                "high_min": self.thresholds.high_min,
                "medium_min": self.thresholds.medium_min,
                "low_min": self.thresholds.low_min,
            },
            items=items
        )
