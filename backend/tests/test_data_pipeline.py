import pytest
import pandas as pd
import numpy as np
from datetime import datetime

from backend.app.ml.data_pipeline import RoadDataPipeline, DataValidationReport

def test_empty_dataset_handling():
    df = pd.DataFrame()
    cleaned_df, report = RoadDataPipeline.validate_and_clean(df)
    assert not report.is_valid
    assert len(report.warnings) > 0

def test_missing_values_detection():
    df = pd.DataFrame({
        "RoadID": ["RD-1", "RD-2", "RD-3"],
        "StreetName": ["Main St", "Oak Ave", None],
        "pci": [85, None, 45],
        "traffic_pcu": ["Heavy", None, "Moderate"]
    })
    cleaned_df, report = RoadDataPipeline.validate_and_clean(df)
    assert report.is_valid
    assert report.missing_field_rates["pci_score"] > 0
    assert report.missing_field_rates["traffic_intensity"] > 0

def test_duplicate_records_deduplication():
    df = pd.DataFrame({
        "segment_id": ["RD-1", "RD-1", "RD-2"],
        "road_name": ["Route 1A", "Route 1B", "Route 2"],
        "current_condition": ["Fair", "Critical", "Good"],
        "pci": [60, 30, 85]
    })
    cleaned_df, report = RoadDataPipeline.validate_and_clean(df)
    assert report.duplicate_records_found == 1
    assert len(cleaned_df) == 2
    # Ensures latest duplicate was retained
    assert cleaned_df.loc[cleaned_df["segment_id"] == "RD-1", "pci_score"].values[0] == 30

def test_invalid_coordinates_handling():
    df = pd.DataFrame({
        "segment_id": ["RD-1", "RD-2", "RD-3"],
        "latitude": [12.9716, 999.0, "invalid"],
        "longitude": [77.5946, 77.5946, -250.0]
    })
    cleaned_df, report = RoadDataPipeline.validate_and_clean(df)
    assert report.invalid_coordinates_count == 2
    assert any("geospatial coordinates" in w for w in report.warnings)

def test_outlier_clipping():
    df = pd.DataFrame({
        "segment_id": ["RD-1", "RD-2"],
        "pci_score": [-15.0, 150.0],
        "length_km": [2500.0, 3.5]  # 2500m should be converted to 2.5km
    })
    cleaned_df, report = RoadDataPipeline.validate_and_clean(df)
    assert cleaned_df["pci_score"].min() >= 0.0
    assert cleaned_df["pci_score"].max() <= 100.0
    assert cleaned_df["length_km"].iloc[0] == 2.5

def test_unknown_categories_normalization():
    df = pd.DataFrame({
        "segment_id": ["RD-1"],
        "road_type": ["Unknown-Alien-Grade"],
        "surface_type": ["Super-Glass"],
        "traffic_intensity": ["Ludicrous Speed"],
        "weather_exposure": ["Solar Storm"]
    })
    cleaned_df, report = RoadDataPipeline.validate_and_clean(df)
    assert cleaned_df["road_type"].iloc[0] == "Unknown-Alien-Grade"
    # Canonical defaults prevent failure
    assert report.is_valid
