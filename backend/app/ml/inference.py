import joblib
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, List
import numpy as np
import pandas as pd

from ..config import config, ARTIFACTS_DIR

logger = logging.getLogger(__name__)

class ModelInference:
    """
    Handles artifact loading, input validation, and inference for deterioration risk.
    """

    def __init__(self, artifact_path: Optional[Path] = None):
        self.artifact_path = artifact_path or config.MODEL_ARTIFACT_PATH
        self.bundle: Optional[Dict[str, Any]] = None
        self.is_loaded: bool = False
        self.load_model()

    def load_model(self) -> bool:
        if self.artifact_path and self.artifact_path.exists():
            try:
                self.bundle = joblib.load(self.artifact_path)
                self.is_loaded = True
                logger.info(f"Loaded ML model {self.bundle.get('version')} from {self.artifact_path}")
                return True
            except Exception as e:
                logger.error(f"Error loading model artifact: {e}")
                self.is_loaded = False
        return False

    def predict_segment(self, feature_dict: Dict[str, float]) -> Tuple[float, float, str, bool]:
        """
        Returns: (predicted_risk_score_0_to_100, confidence_percentage, model_version, is_model_predicted)
        """
        if not self.is_loaded or self.bundle is None:
            # Documented rule-based fallback when model is unavailable
            dmg = feature_dict.get("damage_severity_score", 50.0)
            trf = feature_dict.get("traffic_intensity_score", 50.0)
            det = feature_dict.get("historical_deterioration_score", 50.0)
            fallback_score = round(0.45 * dmg + 0.30 * trf + 0.25 * det, 1)
            return fallback_score, 75.0, "Rule-Based-Fallback-v1.0", False

        try:
            feature_names = self.bundle["feature_names"]
            clf = self.bundle["classifier"]

            row = [feature_dict.get(col, 50.0) for col in feature_names]
            X = pd.DataFrame([row], columns=feature_names)

            # Class probability
            prob = clf.predict_proba(X)[0][1]  # Probability of severe deterioration
            risk_score = round(float(prob * 100.0), 1)

            # Confidence is derived from model margin
            # High certainty if close to 1 or 0
            margin = abs(prob - 0.5) * 2.0  # 0 to 1
            confidence = round(float(78.0 + margin * 18.0), 1)  # 78% to 96%

            version = self.bundle.get("version", config.MODEL_VERSION)
            return risk_score, confidence, version, True
        except Exception as e:
            logger.warning(f"Inference error, reverting to fallback: {e}")
            dmg = feature_dict.get("damage_severity_score", 50.0)
            return dmg, 70.0, "Rule-Based-Fallback-v1.0", False
