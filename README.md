# RoadWatch — Predictive Road Maintenance & Infrastructure Intelligence

A production-quality municipal data science, machine learning, and geospatial intelligence platform that helps city engineers, public works directors, and planning authorities identify road damage, predict maintenance requirements, prioritize inspections, and allocate repair resources efficiently.

---

## Phase 2: Recommendation System & Machine Learning Engine

RoadWatch Phase 2 introduces a complete, explainable, data-driven machine learning and recommendation engine built on top of the completed Phase 1 platform.

### Core Phase 2 Capabilities

1. **Configurable Urgency Scoring Engine**:
   - Transparent multi-factor scoring formula:
     $$\text{Urgency Score} = \sum_{i} (w_i \times \text{Factor}_i) \times 100$$
   - Normalized factor inputs:
     - Damage Severity (30% default)
     - Recent Report Frequency (20% default)
     - Traffic Intensity (15% default)
     - Weather Exposure (15% default)
     - Time Since Last Repair (10% default)
     - Historical Deterioration (10% default)
   - Strict risk category thresholds:
     - **Critical Priority**: 80–100
     - **High Priority**: 60–79
     - **Medium Priority**: 40–59
     - **Low Priority**: 0–39
   - Deterministic tie-breaking rules:
     1. Higher Urgency Score
     2. Higher Damage Severity
     3. Higher Traffic Intensity
     4. Lexicographical Segment ID
   - Human-readable engineering rationale and primary driver extraction for each road recommendation.

2. **Scikit-Learn Machine Learning Pipeline**:
   - Data cleaning, canonical schema mapping, duplicate detection, and geospatial coordinate validation.
   - Time-windowed feature engineering (30-day and 60-day distress velocity, days since inspection, interaction terms).
   - Stratified 80/20 train/test evaluation across:
     - Baseline Dummy Classifier
     - Logistic Regression
     - Random Forest Classifier (deterioration risk probability)
     - Random Forest Regressor (predicted PCI continuous outcome)
   - Uninflated, empirical test metrics reported honestly:
     - Classification Accuracy: **69.3%**
     - Classification F1-Score: **0.531**
     - Regression MAE: **2.52** PCI points
     - Regression R²: **0.364**
   - Versioned joblib artifact serialization (`backend/artifacts/model_v2.4.joblib`) with metadata and metrics JSON records.

3. **FastAPI Microservice Layer (`backend/`)**:
   - High-performance asynchronous REST API supporting both `/api` and `/api/v1` routes.
   - CORS middleware enabled for local React frontend integration.
   - Dynamic priority recalculation on scoring configuration changes (`PATCH /api/scoring/config`).
   - SQLite persistent database (`backend/roadwatch.db`) with full audit logging and auto-seeding.

4. **Polished Dark Purple UI Theme**:
   - Complete visual update across all 14 pages and shared components while strictly preserving layout, navigation, and functionality.

---

## Dark Purple Design System Palette

| Token | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Main Background** | `#100B1D` | Application body and canvas canvas background |
| **Secondary Background** | `#181128` | Header, tables, toolbars, and input container background |
| **Sidebar Background** | `#140E22` | Navigation sidebar background |
| **Card Background** | `#211735` | KPI metric cards, panels, and modal containers |
| **Elevated Card** | `#2B2042` | Hover states, active table rows, and selected items |
| **Primary Accent** | `#A78BFA` | Labels, active icons, highlighted links, and badges |
| **Secondary Accent** | `#8B5CF6` | Primary action buttons and chart bars |
| **Highlight Accent** | `#C4B5FD` | Active focus rings and secondary highlights |
| **Primary Text** | `#F5F3FF` | Main headings, table values, and primary text |
| **Secondary Text** | `#B9AECF` | Subtitles, labels, and metadata descriptions |
| **Borders** | `#3B2D53` | Structural borders, card outlines, and dividers |
| **Success** | `#34D399` | Good condition, resolved status, low risk |
| **Warning** | `#FBBF24` | Fair condition, scheduled status, medium risk |
| **Critical Risk** | `#FB7185` | Critical condition, emergency intervention |
| **Informational** | `#60A5FA` | Telemetry status, active connections, links |

---

## FastAPI Backend Endpoints

### Recommendations & Urgency Ranking
- `GET /api/recommendations`: Paginated, ranked maintenance recommendations with deterministic tie-breaking, filtering (`category`, `road_type`, `ward`), active weights, and threshold metadata.
- `GET /api/recommendations/{segment_id}`: Detailed single-segment recommendation including individual factor scores, normalized values, and engineering rationale.

### Model Predictions & Forecasting
- `GET /api/predictions`: Model-predicted road deterioration risk scores and 30/60/90/180-day forecasts.
- `GET /api/predictions/{segment_id}`: Prediction record for an individual road corridor.
- `POST /api/predictions/run`: Batch inference execution over all active road segments.

### Model Governance & Calibration
- `GET /api/model/metrics`: Model evaluation metrics (MAE, RMSE, R², Accuracy, F1-Score, feature importances).
- `GET /api/model/status`: Production model operational status and metadata.
- `POST /api/model/retrain`: Triggers reproducible model retraining pipeline and updates artifacts.

### Scoring Configuration & Audit
- `GET /api/scoring/config`: Returns active factor weights, threshold boundaries, and version history.
- `PATCH /api/scoring/config`: Dynamically updates scoring weights or thresholds, automatically recalculates urgency rankings across all road segments, and logs an audit record.

---

## Phase 3: Real-Time End-to-End Application Integration

RoadWatch Phase 3 connects the React + MapLibre frontend directly to the Python FastAPI backend, persistent dual-mode database (SQLite / PostgreSQL), machine learning engine, and real-time civic dispatch system.

### Core Phase 3 Capabilities

1. **Real-Time Damage Reporting & Instant Urgency Calculation**:
   - Simplified report form with GPS geolocation button ("Use My Location") and interactive map coordinate selection.
   - Saves directly to the database and computes immediate priority score, risk classification, and explanation.
   - Real-time background sync (every 12s) updates the Dashboard, MapLibre layer, and Reports ledger.

2. **Dual-Mode Database Architecture (SQLite & PostgreSQL / PostGIS)**:
   - Embedded, zero-configuration SQLite persistence (`backend/roadwatch.db`) by default.
   - Seamless automatic switch to PostgreSQL / PostGIS when `DATABASE_URL` is set in the environment.
   - Dedicated seed command (`/api/seed`) and database clear (`/api/reset`). Exactly 3 demonstration roads (`RD-DEMO-01`, `RD-DEMO-02`, `RD-DEMO-03`) with clear demonstrative labeling.

3. **Inspection & Maintenance Progress Lifecycle**:
   - Track reports from `Submitted` → `Under Review` → `Verified` → `Inspection Scheduled` → `Resolved`.
   - Dispatch municipal inspection teams and work orders with live budget tracking.

4. **Polished Dark Purple UI Design System**:
   - Cohesive dark purple palette (`#100B1D` body, `#140E22` sidebar, `#211735` card surfaces, `#A78BFA` primary accent).
   - Strict container constraints (`min-w-0 overflow-x-hidden`) preventing horizontal layout breaking.
   - 100% verified test suite: **33/33 tests passing**.

---

## Local Development & Setup

### 1. Backend Setup & Test Suite Execution
```bash
# Navigate to the repository root
cd roadwatch

# Install Python backend requirements
python -m pip install -r backend/requirements.txt

# Run the full test suite (33 passing tests)
python -m pytest backend/tests -v

# Start the FastAPI backend server (Runs on port 8000)
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive Swagger API documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Frontend Setup & Build
```bash
# In another terminal in the repository root:
npm install

# Start the local development server (Runs on port 5173)
npm run dev

# Or build the production bundle
npm run build
```
React web application: [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## Test Suite Coverage

The backend test suite (`backend/tests/`) includes 33 comprehensive tests verifying:
- **Data Pipeline**: Missing value analysis, duplicate report deduplication, invalid GPS clipping, and outlier handling.
- **ML Pipeline**: Reproducible training on stratified splits, joblib artifact persistence, model inference, and fallback mechanisms.
- **Recommendation Engine**: Weight normalization, threshold category boundary mapping, missing factor handling, deterministic tie-breaking, and explanation generation.
- **API & Database Integration**: End-to-end CRUD for reports, priority recalculation, inspections, maintenance work orders, and dashboard telemetry.

Run tests at any time with:
```bash
python -m pytest backend/tests -v
```

