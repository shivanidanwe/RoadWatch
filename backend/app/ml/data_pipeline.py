import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any, Optional
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)

CANONICAL_COLUMNS = {
    # Segment columns
    "segment_id": ["segment_id", "id", "segmentId", "RoadID", "road_id"],
    "road_name": ["road_name", "name", "roadName", "StreetName"],
    "ward": ["ward", "ward_code", "wardCode", "Zone"],
    "road_type": ["road_type", "roadType", "classification", "Hierarchy"],
    "surface_type": ["surface_type", "surfaceType", "pavement_type"],
    "length_km": ["length_km", "lengthKm", "length_meters", "length"],
    "pci_score": ["pci_score", "pciScore", "pci", "PavementConditionIndex"],
    "current_condition": ["current_condition", "currentCondition", "condition"],
    "traffic_intensity": ["traffic_intensity", "trafficIntensity", "pcu_count", "traffic_pcu"],
    "weather_exposure": ["weather_exposure", "weatherExposure", "flood_zone", "precipitation_mm_24h"],
    "last_inspection_date": ["last_inspection_date", "lastInspectionDate", "inspected_at"],
    "last_maintenance_date": ["last_maintenance_date", "lastMaintenanceDate", "repaired_at", "last_repair_date"],
    "open_reports_count": ["open_reports_count", "openReportsCount", "report_count", "active_distress_tickets"],
    "latitude": ["latitude", "lat", "coord_lat"],
    "longitude": ["longitude", "lng", "lon", "coord_lng"],
}

SURFACE_MAP = {
    "asphalt": 0.8,
    "concrete": 0.3,
    "bituminous macadam": 0.9,
    "paver blocks": 0.6,
    "unknown": 0.5
}

TRAFFIC_MAP = {
    "very low": 15.0,
    "moderate": 45.0,
    "heavy": 75.0,
    "extreme high-volume": 95.0,
    "unknown": 45.0
}

WEATHER_MAP = {
    "low": 15.0,
    "moderate": 45.0,
    "high thermal stress": 70.0,
    "high monsoon flood zone": 95.0,
    "unknown": 45.0
}

SEVERITY_WEIGHTS = {
    "low": 20.0,
    "medium": 50.0,
    "high": 80.0,
    "critical": 100.0,
    "unknown": 40.0
}

CATEGORY_DISTRESS_WEIGHTS = {
    "pothole": 1.0,
    "road subsidence": 1.1,
    "edge failure": 0.85,
    "surface cracking": 0.75,
    "waterlogging": 0.9,
    "surface deterioration": 0.7,
    "other": 0.5
}

class DataValidationReport:
    def __init__(self):
        self.total_records: int = 0
        self.missing_field_rates: Dict[str, float] = {}
        self.duplicate_records_found: int = 0
        self.invalid_coordinates_count: int = 0
        self.outliers_detected: Dict[str, int] = {}
        self.warnings: List[str] = []
        self.is_valid: bool = True

    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_records": self.total_records,
            "missing_field_rates": self.missing_field_rates,
            "duplicate_records_found": self.duplicate_records_found,
            "invalid_coordinates_count": self.invalid_coordinates_count,
            "outliers_detected": self.outliers_detected,
            "warnings": self.warnings,
            "is_valid": self.is_valid
        }

class RoadDataPipeline:
    """
    Production-grade data validation, schema unification, and cleaning pipeline.
    Preserves raw data and provides clear diagnostics.
    """
    
    @staticmethod
    def map_to_canonical(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, str]]:
        mapped_df = pd.DataFrame()
        column_mapping: Dict[str, str] = {}
        
        for canonical, aliases in CANONICAL_COLUMNS.items():
            matched_col = None
            for alias in aliases:
                for col in df.columns:
                    if col.strip().lower() == alias.lower():
                        matched_col = col
                        break
                if matched_col:
                    break
            
            if matched_col:
                mapped_df[canonical] = df[matched_col]
                column_mapping[matched_col] = canonical
            else:
                mapped_df[canonical] = np.nan
                
        return mapped_df, column_mapping

    @staticmethod
    def validate_and_clean(
        raw_df: pd.DataFrame, 
        reports_df: Optional[pd.DataFrame] = None,
        reference_date: Optional[datetime] = None
    ) -> Tuple[pd.DataFrame, DataValidationReport]:
        report = DataValidationReport()
        report.total_records = len(raw_df)

        if report.total_records == 0:
            report.is_valid = False
            report.warnings.append("Dataset is empty.")
            return raw_df.copy(), report

        df, col_map = RoadDataPipeline.map_to_canonical(raw_df)

        # 1. Missing Value Analysis
        missing_rates = (df.isnull().sum() / len(df)).to_dict()
        report.missing_field_rates = {k: round(v, 4) for k, v in missing_rates.items()}

        # 2. Duplicate Detection
        if "segment_id" in df.columns:
            dupes = df["segment_id"].dropna().duplicated().sum()
            report.duplicate_records_found = int(dupes)
            if dupes > 0:
                report.warnings.append(f"Found {dupes} duplicate road segment IDs. Deduplicating by keeping latest record.")
                df = df.drop_duplicates(subset=["segment_id"], keep="last")

        # 3. Geospatial Validation
        invalid_coords = 0
        if "latitude" in df.columns and "longitude" in df.columns:
            lat = pd.to_numeric(df["latitude"], errors="coerce")
            lng = pd.to_numeric(df["longitude"], errors="coerce")
            invalid_mask = (lat < -90) | (lat > 90) | (lng < -180) | (lng > 180) | lat.isna() | lng.isna()
            invalid_coords = int(invalid_mask.sum())
            if invalid_coords > 0:
                report.warnings.append(f"Found {invalid_coords} records with invalid/missing geospatial coordinates.")
        report.invalid_coordinates_count = invalid_coords

        # 4. Numeric Bounds & Outlier Inspection
        cleaned_df = df.copy()
        
        # PCI: valid range 0 to 100
        pci = pd.to_numeric(cleaned_df["pci_score"], errors="coerce")
        out_pci = ((pci < 0) | (pci > 100)).sum()
        if out_pci > 0:
            report.outliers_detected["pci_score"] = int(out_pci)
            pci = pci.clip(0, 100)
        cleaned_df["pci_score"] = pci

        # Length km: convert meters to km if large values detected
        length = pd.to_numeric(cleaned_df["length_km"], errors="coerce")
        if (length > 150).any():
            # values likely in meters
            length = length.apply(lambda x: x / 1000.0 if x > 150 else x)
        cleaned_df["length_km"] = length.fillna(1.0).clip(0.1, 100.0)

        # 5. Categorical normalization
        cleaned_df["road_type"] = cleaned_df["road_type"].astype(str).str.strip().str.title().replace({"Nan": "Collector", "": "Collector"})
        cleaned_df["surface_type"] = cleaned_df["surface_type"].astype(str).str.strip().str.title().replace({"Nan": "Asphalt", "": "Asphalt"})
        cleaned_df["traffic_intensity"] = cleaned_df["traffic_intensity"].astype(str).str.strip().replace({"Nan": "Moderate", "": "Moderate"})
        cleaned_df["weather_exposure"] = cleaned_df["weather_exposure"].astype(str).str.strip().replace({"Nan": "Moderate", "": "Moderate"})

        # 6. Dates parsing
        ref_dt = reference_date or datetime.now()
        cleaned_df["last_inspection_dt"] = pd.to_datetime(cleaned_df["last_inspection_date"], errors="coerce")
        cleaned_df["last_maintenance_dt"] = pd.to_datetime(cleaned_df["last_maintenance_date"], errors="coerce")

        report.is_valid = True
        return cleaned_df, report

