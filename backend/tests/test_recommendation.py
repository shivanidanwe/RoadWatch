import pytest
from backend.app.config import ScoringWeights, RiskThresholds
from backend.app.recommendation.engine import RecommendationEngine

def test_weights_normalization():
    weights = ScoringWeights(
        damage_severity=30,
        recent_report_frequency=20,
        traffic_intensity=15,
        weather_exposure=15,
        time_since_last_repair=10,
        historical_deterioration=10
    )
    norm = weights.normalized()
    assert pytest.approx(sum(norm.values()), 0.001) == 1.0
    assert norm["damage_severity"] == 0.30

def test_weights_validation_zero_rejection():
    with pytest.raises(ValueError):
        weights = ScoringWeights(
            damage_severity=0,
            recent_report_frequency=0,
            traffic_intensity=0,
            weather_exposure=0,
            time_since_last_repair=0,
            historical_deterioration=0
        )
        weights.normalized()

def test_category_boundary_mapping():
    engine = RecommendationEngine()
    # Critical: >= 80
    assert engine.map_score_to_category(100.0) == "Critical"
    assert engine.map_score_to_category(80.0) == "Critical"
    # High: 60 - 79.9
    assert engine.map_score_to_category(79.9) == "High"
    assert engine.map_score_to_category(60.0) == "High"
    # Medium: 40 - 59.9
    assert engine.map_score_to_category(59.9) == "Medium"
    assert engine.map_score_to_category(40.0) == "Medium"
    # Low: < 40
    assert engine.map_score_to_category(39.9) == "Low"
    assert engine.map_score_to_category(0.0) == "Low"

def test_missing_factor_fallback_and_warning():
    engine = RecommendationEngine()
    score, factors, warnings = engine.calculate_urgency_score(
        damage_severity=85.0,
        recent_report_frequency=70.0,
        traffic_intensity=50.0,
        weather_exposure=50.0,
        time_since_last_repair=50.0,
        historical_deterioration=50.0,
        available_factors={"weather_exposure": False, "traffic_intensity": True}
    )
    assert score > 0
    assert len(warnings) > 0
    assert "weather_exposure" in warnings[0]

def test_deterministic_tie_breaking():
    engine = RecommendationEngine()
    seg_a = {
        "segment_id": "RD-A", "road_name": "Alpha Way", "ward": "Ward 1",
        "damage_severity_score": 85.0, "traffic_intensity_score": 80.0,
        "recent_report_frequency_score": 80.0, "weather_exposure_score": 80.0,
        "time_since_last_repair_score": 80.0, "historical_deterioration_score": 80.0
    }
    seg_b = {
        "segment_id": "RD-B", "road_name": "Beta Way", "ward": "Ward 1",
        "damage_severity_score": 95.0,  # Higher damage severity breaks tie
        "traffic_intensity_score": 70.0,
        "recent_report_frequency_score": 80.0, "weather_exposure_score": 80.0,
        "time_since_last_repair_score": 80.0, "historical_deterioration_score": 80.0
    }
    rec_a = engine.evaluate_segment(seg_a)
    rec_b = engine.evaluate_segment(seg_b)

    paginated = engine.rank_segments([rec_a, rec_b])
    # rec_b has higher damage severity, so it must rank 1st even if scores are close
    assert paginated.items[0].segment_id == "RD-B"
    assert paginated.items[0].rank == 1
    assert paginated.items[1].rank == 2

def test_explanation_generation_content():
    engine = RecommendationEngine()
    seg = {
        "segment_id": "RD-TEST",
        "road_name": "Market Arterial",
        "damage_severity_score": 92.0,
        "traffic_intensity_score": 90.0,
        "recent_report_frequency_score": 40.0,
        "weather_exposure_score": 85.0,
        "time_since_last_repair_score": 75.0,
        "historical_deterioration_score": 80.0,
    }
    rec = engine.evaluate_segment(seg)
    assert rec.risk_category in rec.explanation.summary
    assert len(rec.explanation.reasons) >= 2
    assert rec.recommended_action == "Immediate inspection"
