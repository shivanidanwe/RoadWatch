from typing import List, Dict, Optional, Any, Union
from pydantic import BaseModel, Field

class FactorDetail(BaseModel):
    name: str
    score: float = Field(..., ge=0.0, le=100.0, description="Normalized score 0-100")
    weight: float = Field(..., ge=0.0, le=1.0, description="Active weight proportion 0-1")
    impact: str = Field(..., description="High, Moderate, or Low")
    description: str

class RecommendationExplanation(BaseModel):
    summary: str
    primary_driver: str
    reasons: List[str]
    warnings: List[str] = Field(default_factory=list)

class RoadUrgencyRecommendation(BaseModel):
    rank: int
    segment_id: str
    road_name: str
    ward: str
    road_type: str
    surface_type: str
    length_km: float
    coordinates: List[float]
    urgency_score: float = Field(..., ge=0.0, le=100.0)
    risk_category: str
    predicted_risk: Optional[float] = None
    confidence_score: float
    uncertainty_margin: str
    recommended_action: str
    factors: Dict[str, FactorDetail]
    explanation: RecommendationExplanation
    data_quality_notes: str
    model_version: str
    scoring_version: str
    scored_at: str

class PaginatedRecommendations(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    active_weights: Dict[str, float]
    thresholds: Dict[str, float]
    items: List[RoadUrgencyRecommendation]

class RoadPredictionOutput(BaseModel):
    segment_id: str
    road_name: str
    ward: str
    risk_score: float
    priority: str
    predicted_condition: str
    prediction_horizon: str
    confidence_score: float
    uncertainty_margin: str
    factors: Dict[str, FactorDetail]
    recommended_action: str
    explanation: str
    modelVersion: str
    lastUpdated: str
    dataQualityNotes: str
    historical_trend: Optional[List[Dict[str, Any]]] = None

class ModelFeatureImportance(BaseModel):
    feature: str
    importance: float

class ModelMetricsResponse(BaseModel):
    version: str
    algorithm: str
    training_date: str
    evaluation_date: str
    training_samples_count: int
    mae: Optional[float] = None
    rmse: Optional[float] = None
    r2_score: Optional[float] = None
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: Optional[float] = None
    confusion_matrix: Optional[List[List[int]]] = None
    feature_importance: List[ModelFeatureImportance]
    drift_status: str
    is_active: bool
    status: str
    notes: Optional[str] = None

class ModelStatusResponse(BaseModel):
    is_trained: bool
    version: str
    algorithm: str
    last_trained: str
    sample_count: int
    status: str
    artifact_path: Optional[str] = None

class ScoringConfigUpdate(BaseModel):
    damage_severity: Optional[float] = Field(None, ge=0.0, le=1.0)
    recent_report_frequency: Optional[float] = Field(None, ge=0.0, le=1.0)
    traffic_intensity: Optional[float] = Field(None, ge=0.0, le=1.0)
    weather_exposure: Optional[float] = Field(None, ge=0.0, le=1.0)
    time_since_last_repair: Optional[float] = Field(None, ge=0.0, le=1.0)
    historical_deterioration: Optional[float] = Field(None, ge=0.0, le=1.0)
    critical_min: Optional[float] = Field(None, ge=0.0, le=100.0)
    high_min: Optional[float] = Field(None, ge=0.0, le=100.0)
    medium_min: Optional[float] = Field(None, ge=0.0, le=100.0)
    low_min: Optional[float] = Field(None, ge=0.0, le=100.0)
    updated_by: Optional[str] = "Municipal Administrator"
    reason: Optional[str] = "Operational calibration"

class ScoringConfigResponse(BaseModel):
    version: str
    active_weights: Dict[str, float]
    thresholds: Dict[str, float]
    last_updated: str
    updated_by: str
    audit_history_count: int

class AuditLogItem(BaseModel):
    id: str
    timestamp: str
    user: str
    action: str
    details: str

