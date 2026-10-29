import pandas as pd
import numpy as np
from datetime import datetime
from typing import Optional, Dict, Any, List

from .data_pipeline import (
    SURFACE_MAP,
    TRAFFIC_MAP,
    WEATHER_MAP,
    SEVERITY_WEIGHTS,
    CATEGORY_DISTRESS_WEIGHTS
)

class FeatureEngineer:
    """
    Computes explainable, leakage-free features from cleaned road segments and distress reports.
    """

    def __init__(self, reference_date: Optional[datetime] = None):
        self.reference_date = reference_date or datetime.now()

    def engineer_features(
        self, 
        roads_df: pd.DataFrame, 
        reports_df: Optional[pd.DataFrame] = None
    ) -> pd.DataFrame:
        df = roads_df.copy()

        # 1. Temporal Gap Features (Days since last maintenance & inspection)
        if "last_maintenance_dt" in df.columns:
            df["days_since_last_repair"] = (self.reference_date - df["last_maintenance_dt"]).dt.days
            # Fallback for missing repair date: assume 730 days (2 years) median municipal cycle, mark as estimated
            df["repair_date_missing"] = df["days_since_last_repair"].isna().astype(int)
            df["days_since_last_repair"] = df["days_since_last_repair"].fillna(730).clip(lower=0)
        else:
            df["days_since_last_repair"] = 730
            df["repair_date_missing"] = 1

        if "last_inspection_dt" in df.columns:
            df["days_since_last_inspection"] = (self.reference_date - df["last_inspection_dt"]).dt.days
            df["inspection_date_missing"] = df["days_since_last_inspection"].isna().astype(int)
            df["days_since_last_inspection"] = df["days_since_last_inspection"].fillna(180).clip(lower=0)
        else:
            df["days_since_last_inspection"] = 180
            df["inspection_date_missing"] = 1

        # 2. Distress Reports Aggregation (Frequency and Severity)
        if reports_df is not None and not reports_df.empty and "segment_id" in reports_df.columns:
            rep = reports_df.copy()
            # Standardize column names in reports
            col_map = {c: c.lower() for c in rep.columns}
            rep.rename(columns=col_map, inplace=True)

            date_col = next((c for c in ["reportdate", "report_date", "date", "created_at"] if c in rep.columns), None)
            if date_col:
                rep["parsed_dt"] = pd.to_datetime(rep[date_col], errors="coerce")
            else:
                rep["parsed_dt"] = self.reference_date

            rep["age_days"] = (self.reference_date - rep["parsed_dt"]).dt.days.fillna(15)

            # Assign numeric distress severity
            sev_col = next((c for c in ["severity", "severity_level"] if c in rep.columns), None)
            cat_col = next((c for c in ["category", "issue_type", "type"] if c in rep.columns), None)

            def calc_report_weight(row):
                s = str(row[sev_col]).strip().lower() if sev_col else "medium"
                c = str(row[cat_col]).strip().lower() if cat_col else "pothole"
                base_sev = SEVERITY_WEIGHTS.get(s, 50.0)
                cat_mult = CATEGORY_DISTRESS_WEIGHTS.get(c, 0.8)
                return base_sev * cat_mult

            rep["distress_score"] = rep.apply(calc_report_weight, axis=1)

            # Aggregate per road segment
            # A. 30-day recent reports
            r30 = rep[rep["age_days"] <= 30].groupby("segment_id").agg(
                recent_reports_30d=("distress_score", "count"),
                max_recent_severity=("distress_score", "max"),
                avg_recent_severity=("distress_score", "mean")
            ).reset_index()

            # B. 60-day reports
            r60 = rep[rep["age_days"] <= 60].groupby("segment_id").agg(
                recent_reports_60d=("distress_score", "count")
            ).reset_index()

            # Merge aggregations
            df = df.merge(r30, on="segment_id", how="left")
            df = df.merge(r60, on="segment_id", how="left")
        else:
            df["recent_reports_30d"] = np.nan
            df["max_recent_severity"] = np.nan
            df["avg_recent_severity"] = np.nan
            df["recent_reports_60d"] = np.nan

        # Use open_reports_count fallback if available
        if "open_reports_count" in df.columns:
            open_cnt = pd.to_numeric(df["open_reports_count"], errors="coerce").fillna(0)
            df["recent_reports_30d"] = df["recent_reports_30d"].fillna(open_cnt)
            df["recent_reports_60d"] = df["recent_reports_60d"].fillna(open_cnt * 1.5)
        else:
            df["recent_reports_30d"] = df["recent_reports_30d"].fillna(0)
            df["recent_reports_60d"] = df["recent_reports_60d"].fillna(0)

        # 3. Normalized Factor Scores (0 - 100 scale for each feature)
        # Damage Severity Factor (0 - 100)
        # Combines report severity, open reports count, and condition
        cond_map = {"Critical": 95.0, "Poor": 75.0, "Fair": 45.0, "Good": 15.0}
        curr_cond_score = df["current_condition"].astype(str).map(cond_map).fillna(50.0)
        
        # Max report severity (if available, otherwise estimate from current condition)
        max_sev = df["max_recent_severity"].fillna(curr_cond_score)
        rep_density_boost = (df["recent_reports_30d"].clip(0, 10) / 10.0) * 20.0
        df["damage_severity_score"] = np.clip(0.7 * max_sev + 0.3 * curr_cond_score + rep_density_boost, 0.0, 100.0)

        # Recent Report Frequency Score (0 - 100)
        # 0 reports = 10, 1-2 = 40, 3-5 = 70, 6+ = 95
        df["recent_report_frequency_score"] = np.clip(df["recent_reports_30d"] * 16.0 + 10.0, 10.0, 100.0)

        # Traffic Intensity Score (0 - 100)
        df["traffic_intensity_score"] = df["traffic_intensity"].astype(str).str.lower().map(TRAFFIC_MAP).fillna(50.0)

        # Weather Exposure Score (0 - 100)
        df["weather_exposure_score"] = df["weather_exposure"].astype(str).str.lower().map(WEATHER_MAP).fillna(45.0)

        # Time Since Last Repair Score (0 - 100)
        # 1 year (365d) ~ 40, 2 years (730d) ~ 70, 3+ years (1095d+) ~ 95
        df["time_since_last_repair_score"] = np.clip((df["days_since_last_repair"] / 1095.0) * 90.0 + 10.0, 10.0, 100.0)

        # Historical Deterioration Score (0 - 100)
        # Derived from Pavement Condition Index (PCI 0-100, where low PCI = severe deterioration)
        if "pci_score" in df.columns:
            pci = pd.to_numeric(df["pci_score"], errors="coerce").fillna(50.0)
            df["historical_deterioration_score"] = np.clip(100.0 - pci, 0.0, 100.0)
        else:
            df["historical_deterioration_score"] = 50.0

        # Pavement Material Decay Rate (Asphalt vs Concrete vs Macadam)
        df["surface_decay_factor"] = df["surface_type"].astype(str).str.lower().map(SURFACE_MAP).fillna(0.7)

        # Interaction feature: Traffic load * Weather exposure (Moisture under heavy wheel loads causes subgrade failure)
        df["traffic_weather_interaction"] = (df["traffic_intensity_score"] * df["weather_exposure_score"]) / 100.0

        return df

    def get_feature_names(self) -> List[str]:
        return [
            "damage_severity_score",
            "recent_report_frequency_score",
            "traffic_intensity_score",
            "weather_exposure_score",
            "time_since_last_repair_score",
            "historical_deterioration_score",
            "days_since_last_repair",
            "days_since_last_inspection",
            "surface_decay_factor",
            "traffic_weather_interaction",
        ]

