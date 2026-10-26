# RoadWatch — Predictive Road Maintenance & Infrastructure Intelligence

A production-quality municipal data science and geospatial intelligence platform that helps city engineers, public works directors, and planning authorities identify road damage, predict maintenance requirements, prioritize inspections, and allocate repair resources efficiently.

---

## Key Modules & Capabilities

1. **Executive Dashboard (`/dashboard`)**
   - 6 Core Municipal KPIs: Total Segments, Open Distress Tickets, Critical Priority Segments, Scheduled Inspections, Capital Maintenance Backlog, and Composite Predicted Risk (0–100).
   - Dynamic Recharts Visualizations: Road Condition Breakdown, Priority Spread, Contributing Risk Drivers (Radar), 6-Month Actual vs Forecast Trajectory, and Weekly Resolution Volumes.
   - Urgent Attention Segments Table with one-click map routing.

2. **Live Geospatial Road Map (`/map`)**
   - Interactive MapLibre GL JS vector and raster cartography.
   - Color-coded road segment centroids, real-time distress markers, and inspection pinpoints.
   - Layer visibility toggles (Roads, Issues, Inspections), extent zoom, and full-screen view.
   - Comprehensive detail side drawer displaying Pavement Condition Index (PCI), traffic PCU intensity, monsoon flood exposure, and advisory engineering recommendations.

3. **Road Segments Inventory (`/roads`)**
   - Master catalog of all classified arterial, sub-arterial, collector, and local roads.
   - Multi-criteria filtering by Ward, Condition Grade, and Urgency Priority.
   - Sortable columns, adjustable pagination, bulk selection, CSV export, and creation/edit modals.

4. **Issue Reports Management (`/reports`)**
   - End-to-end tracking of citizen, sensor, and patrol distress reports across 7 categories (Pothole, Surface Cracking, Waterlogging, Subsidence, Deterioration, Edge Failure, Other).
   - Complete status workflow progression: `Submitted` → `Under Review` → `Verified` → `Inspection Scheduled` → `Maintenance Planned` → `Resolved`.
   - Visual photographic evidence preview and audit trail timeline.

5. **Field Inspection Management (`/inspections`)**
   - Scheduling and dispatch for certified pavement engineers and hydrological auditors.
   - Dual List and Weekly Matrix Calendar views.
   - Ground-truth survey modal to record observed PCI, structural integrity score, damage spread %, and drainage conditions.

6. **Predictive Risk Assessment & Explainability (`/predictions`)**
   - Model-assisted forecasting estimating failure probabilities across 30, 60, 90, and 180-day horizons.
   - Explainability Panel: Transparently breaks down why an engineering segment was prioritized via 4 weighted stress factors (Damage Severity, Traffic Load, Monsoon Runoff, and Maintenance Gap).
   - Side-by-side comparison modal and simulated prediction execution.

7. **Maintenance Planning & Capital Outlay (`/maintenance`)**
   - Capital works management converting prioritized distress into actionable projects.
   - Budget tracking: Active Committed, Backlog Estimate, and Completed FY Expenditure.
   - Status progression and final sign-off modal with audited actual costs.

8. **Analytics & Insights (`/analytics`)**
   - 10 empirical data science views including quarterly condition area trends, SLA resolution turnaround, capital spending distributions, and Gaussian risk histograms.
   - Print-friendly layout and instant CSV export.

9. **Data Science Dataset Explorer (`/data`)**
   - Schema inspector and record previewer for relational PostgreSQL and PostGIS tables.
   - Missing value rates, schema validation reports, sample CSV template download, and staged upload simulation.

10. **Engineering Workforce & Team Directory (`/team`)**
    - Roster management for inspectors, maintenance supervisors, and data analysts.
    - Active workload distribution and ward jurisdiction tracking.

11. **Model Monitoring & Governance (`/models`)**
    - Machine learning performance tracking (MAE, RMSE, R², Accuracy, F1-Score).
    - Gini impurity feature importance charts and Kolmogorov-Smirnov drift monitoring.
    - Version comparison matrix and async retraining job dispatch.

12. **Data Sources & Telemetry Integrations (`/settings/data-sources`)**
    - Real-time handshake monitoring for PostgreSQL/PostGIS, FastAPI microservices, Doppler radar weather feeds, and ATCS traffic loop sensors.

13. **Platform Configuration & Urgency Thresholds (`/settings`)**
    - Configurable priority threshold bands (Low: 0–24, Medium: 25–49, High: 50–74, Critical: 75–100).
    - Normalized feature scoring weights balancing.
    - Safe Demo Mode persistence and complete state reset.

14. **Authentication & Session Portal (`/login`, `/forgot-password`, `/reset-password`)**
    - Split-screen civic authentication with quick demo sign-in for Chief Engineer, Inspector, Analyst, and Administrator.

---

## Technology Stack

- **Frontend Core**: React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Lucide React icons
- **Data Visualization**: Recharts (Line, Area, Bar, Pie, Radar charts)
- **Geospatial Mapping**: MapLibre GL JS
- **API & State Architecture**: Centralized typed API service layer with localStorage demo persistence and seamless backend fallback
- **Backend Ready**: Configured for Python 3.11, FastAPI, Scikit-learn, GeoPandas, PostgreSQL 16 & PostGIS

---

## Quickstart & Local Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build production bundle**:
   ```bash
   npm run build
   ```

---

## Design System Palette

- **Primary Navy**: `#1A237E`
- **Secondary Blue**: `#283593`
- **Action Blue**: `#2563EB`
- **Teal Accent**: `#0F766E`
- **Page Background**: `#F5F7FA`
- **Card Background**: `#FFFFFF`
- **Critical Alert**: `#DC2626`
- **High Priority**: `#EA580C`
- **Medium Priority**: `#D97706`
- **Low Priority**: `#15803D`
