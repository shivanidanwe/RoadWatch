import pytest
import os
from pathlib import Path
from backend.app.config import ARTIFACTS_DIR
from backend.app.ml.training import ModelTrainer
from backend.app.ml.inference import ModelInference

def test_training_pipeline_execution():
    trainer = ModelTrainer(model_version="v2.4-TestRun")
    metrics = trainer.train_and_evaluate()
    
    assert "accuracy" in metrics
    assert "f1_score" in metrics
    assert "mae" in metrics
    assert "feature_importance" in metrics
    assert len(metrics["feature_importance"]) > 0
    assert metrics["training_samples_count"] > 100

def test_model_artifact_serialization():
    artifact_path = ARTIFACTS_DIR / "model_v2.4.joblib"
    metrics_path = ARTIFACTS_DIR / "metrics.json"
    meta_path = ARTIFACTS_DIR / "model_metadata.json"

    assert artifact_path.exists()
    assert metrics_path.exists()
    assert meta_path.exists()

def test_inference_with_loaded_model():
    inference = ModelInference()
    assert inference.is_loaded

    test_features = {
        "damage_severity_score": 90.0,
        "recent_report_frequency_score": 85.0,
        "traffic_intensity_score": 80.0,
        "weather_exposure_score": 75.0,
        "time_since_last_repair_score": 90.0,
        "historical_deterioration_score": 75.0,
        "days_since_last_repair": 850.0,
        "days_since_last_inspection": 90.0,
        "surface_decay_factor": 0.8,
        "traffic_weather_interaction": 60.0
    }

    risk_score, conf, ver, is_model = inference.predict_segment(test_features)
    assert 0.0 <= risk_score <= 100.0
    assert 50.0 <= conf <= 100.0
    assert is_model is True

def test_inference_fallback_when_artifact_missing():
    # Pass non-existent path
    dummy_inf = ModelInference(artifact_path=Path("non_existent_model.joblib"))
    assert not dummy_inf.is_loaded

    test_features = {"damage_severity_score": 70.0, "traffic_intensity_score": 60.0, "historical_deterioration_score": 50.0}
    risk, conf, ver, is_model = dummy_inf.predict_segment(test_features)
    assert not is_model
    assert "Fallback" in ver
    assert risk > 0
