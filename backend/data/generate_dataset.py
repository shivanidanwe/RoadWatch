import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path

def generate_synthetic_dataset(n_samples: int = 1500, random_seed: int = 42) -> pd.DataFrame:
    """
    Generates a realistic municipal road dataset with engineering distress mechanics
    for Phase 2 model training and evaluation.
    Clearly identified as a synthetic demonstration dataset.
    """
    np.random.seed(random_seed)

    wards = [f"Ward {i} - {'North' if i <= 4 else 'East' if i <= 8 else 'South' if i <= 12 else 'West'} Zone" for i in range(1, 17)]
    road_types = ["Arterial", "Sub-Arterial", "Collector", "Local Access"]
    surface_types = ["Asphalt", "Concrete", "Bituminous Macadam", "Paver Blocks"]
    traffic_levels = ["Very Low", "Moderate", "Heavy", "Extreme High-Volume"]
    weather_levels = ["Low", "Moderate", "High Thermal Stress", "High Monsoon Flood Zone"]

    data = []
    base_date = datetime(2024, 10, 26)

    for i in range(1, n_samples + 1):
        seg_id = f"RD-{1000 + i}"
        ward = np.random.choice(wards)
        road_type = np.random.choice(road_types, p=[0.25, 0.30, 0.30, 0.15])
        surface_type = np.random.choice(surface_types, p=[0.55, 0.15, 0.20, 0.10])
        length_km = round(float(np.random.gamma(shape=2.5, scale=1.2)), 2)

        # Baseline Pavement Condition Index (PCI: 0 - 100)
        pci = round(float(np.clip(np.random.normal(loc=62.0, scale=18.0), 10.0, 98.0)), 1)

        # Days since last maintenance (up to 4 years)
        days_since_repair = int(np.clip(np.random.exponential(scale=480), 30, 1500))
        last_maint_date = (base_date - timedelta(days=days_since_repair)).strftime("%Y-%m-%d")

        # Days since last inspection
        days_since_insp = int(np.clip(np.random.exponential(scale=90), 10, 365))
        last_insp_date = (base_date - timedelta(days=days_since_insp)).strftime("%Y-%m-%d")

        # Traffic intensity
        traffic = np.random.choice(traffic_levels, p=[0.20, 0.40, 0.25, 0.15])
        traffic_score = {"Very Low": 15, "Moderate": 45, "Heavy": 75, "Extreme High-Volume": 95}[traffic]

        # Weather exposure
        weather = np.random.choice(weather_levels, p=[0.25, 0.45, 0.15, 0.15])
        weather_score = {"Low": 15, "Moderate": 45, "High Thermal Stress": 70, "High Monsoon Flood Zone": 95}[weather]

        # Distress report frequency (correlated with low PCI and traffic)
        distress_prob = max(0.05, (100.0 - pci) / 100.0 * 0.7 + (traffic_score / 100.0) * 0.3)
        open_reports = int(np.random.poisson(lam=distress_prob * 4.5))

        # Reported severity score
        if open_reports == 0:
            reported_severity = round(float(np.clip(100.0 - pci, 10.0, 50.0)), 1)
        else:
            reported_severity = round(float(np.clip((100.0 - pci) * 0.7 + open_reports * 8.0, 20.0, 100.0)), 1)

        # Realistic Coordinates centered around metropolitan area
        lat = 12.90 + np.random.uniform(-0.08, 0.12)
        lng = 77.55 + np.random.uniform(-0.09, 0.14)

        # Structural engineering degradation physics:
        # Deterioration probability is driven by low PCI, high traffic, water exposure, and long maintenance gap
        stress_index = (
            0.35 * (100.0 - pci) +
            0.25 * traffic_score +
            0.20 * weather_score +
            0.15 * (days_since_repair / 15.0) +
            0.05 * (reported_severity)
        ) / 100.0

        # Non-linear logistic failure curve
        failure_prob = 1.0 / (1.0 + np.exp(-1 * (stress_index * 6.5 - 3.8)))
        # Target label 1: High Deterioration Risk within 90 days (1 = Deteriorates/Requires Emergency Intervention, 0 = Stable)
        deteriorates_90d = 1 if np.random.rand() < failure_prob else 0

        # Continuous target: Future PCI degradation over 90 days
        pci_drop = round(float(np.clip(np.random.normal(loc=failure_prob * 18.0, scale=3.0), 0.5, 35.0)), 1)

        data.append({
            "segment_id": seg_id,
            "road_name": f"{ward.split(' - ')[0]} Sector {i % 24 + 1} Corridor",
            "ward": ward,
            "road_type": road_type,
            "surface_type": surface_type,
            "length_km": length_km,
            "pci_score": pci,
            "current_condition": "Critical" if pci < 35 else "Poor" if pci < 55 else "Fair" if pci < 75 else "Good",
            "traffic_intensity": traffic,
            "weather_exposure": weather,
            "open_reports_count": open_reports,
            "last_maintenance_date": last_maint_date,
            "last_inspection_date": last_insp_date,
            "latitude": round(lat, 5),
            "longitude": round(lng, 5),
            "deterioration_risk_label": deteriorates_90d,
            "future_pci_drop_90d": pci_drop,
            "dataset_provenance": "Synthetic Demonstration Dataset (RoadWatch Phase 2 ML Benchmark)"
        })

    df = pd.DataFrame(data)
    out_dir = Path(__file__).resolve().parent
    out_path = out_dir / "synthetic_demonstration_road_dataset.csv"
    df.to_csv(out_path, index=False)
    print(f"Generated {len(df)} records in synthetic dataset: {out_path}")
    return df

if __name__ == "__main__":
    generate_synthetic_dataset()

