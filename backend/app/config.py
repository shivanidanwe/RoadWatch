import os
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Dict, Any

BASE_DIR = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"
DATA_DIR = BASE_DIR / "data"

ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

class ScoringWeights(BaseModel):
    damage_severity: float = Field(default=0.30, ge=0.0, le=100.0, description="Reported damage severity weight")
    recent_report_frequency: float = Field(default=0.20, ge=0.0, le=100.0, description="Recent report frequency weight")
    traffic_intensity: float = Field(default=0.15, ge=0.0, le=100.0, description="Traffic intensity and PCU weight")
    weather_exposure: float = Field(default=0.15, ge=0.0, le=100.0, description="Monsoon flood & weather exposure weight")
    time_since_last_repair: float = Field(default=0.10, ge=0.0, le=100.0, description="Time since last repair weight")
    historical_deterioration: float = Field(default=0.10, ge=0.0, le=100.0, description="Historical deterioration / PCI degradation weight")

    def normalized(self) -> Dict[str, float]:
        total = (
            self.damage_severity +
            self.recent_report_frequency +
            self.traffic_intensity +
            self.weather_exposure +
            self.time_since_last_repair +
            self.historical_deterioration
        )
        if total <= 0:
            raise ValueError("Total weights must be strictly greater than 0")
        return {
            "damage_severity": self.damage_severity / total,
            "recent_report_frequency": self.recent_report_frequency / total,
            "traffic_intensity": self.traffic_intensity / total,
            "weather_exposure": self.weather_exposure / total,
            "time_since_last_repair": self.time_since_last_repair / total,
            "historical_deterioration": self.historical_deterioration / total,
        }

class RiskThresholds(BaseModel):
    critical_min: float = Field(default=80.0, ge=0.0, le=100.0)
    high_min: float = Field(default=60.0, ge=0.0, le=100.0)
    medium_min: float = Field(default=40.0, ge=0.0, le=100.0)
    low_min: float = Field(default=0.0, ge=0.0, le=100.0)

    def validate_thresholds(self):
        if not (self.low_min <= self.medium_min <= self.high_min <= self.critical_min <= 100.0):
            raise ValueError("Thresholds must satisfy: low <= medium <= high <= critical <= 100")

class AppConfig:
    ENV: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'roadwatch.db'}")
    MODEL_VERSION: str = os.getenv("MODEL_VERSION", "v2.4-RandomForest-Ensemble")
    MODEL_ARTIFACT_PATH: Path = ARTIFACTS_DIR / "model_v2.4.joblib"
    MODEL_METADATA_PATH: Path = ARTIFACTS_DIR / "model_metadata.json"
    MODEL_METRICS_PATH: Path = ARTIFACTS_DIR / "metrics.json"

    DEFAULT_WEIGHTS = ScoringWeights()
    DEFAULT_THRESHOLDS = RiskThresholds()

config = AppConfig()
