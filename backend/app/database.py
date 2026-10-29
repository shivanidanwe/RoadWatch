import sqlite3
import json
import os
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional

from .config import config, BASE_DIR

logger = logging.getLogger(__name__)

DB_PATH = BASE_DIR / "roadwatch.db"

class Database:
    def __init__(self, db_path: Optional[Path] = None):
        self.db_path = str(db_path or DB_PATH)
        self.is_postgres = False
        self.pg_conn_str = os.getenv("DATABASE_URL", "")
        if self.pg_conn_str.startswith("postgresql://") or self.pg_conn_str.startswith("postgres://"):
            try:
                import psycopg2
                from psycopg2.extras import RealDictCursor
                conn = psycopg2.connect(self.pg_conn_str)
                conn.close()
                self.is_postgres = True
                logger.info("Connected to PostgreSQL database.")
            except Exception as e:
                logger.warning(f"Could not connect to PostgreSQL ({e}), falling back to SQLite: {self.db_path}")
                self.is_postgres = False

        self.init_db()

    def get_connection(self):
        if self.is_postgres:
            import psycopg2
            from psycopg2.extras import RealDictCursor
            conn = psycopg2.connect(self.pg_conn_str, cursor_factory=RealDictCursor)
            return conn
        else:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            return conn

    def init_db(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # 1. Road Segments Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS road_segments (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                ward TEXT NOT NULL,
                length_km REAL NOT NULL,
                road_type TEXT NOT NULL,
                surface_type TEXT NOT NULL,
                current_condition TEXT NOT NULL,
                pci_score REAL NOT NULL,
                risk_score REAL NOT NULL,
                priority TEXT NOT NULL,
                traffic_intensity TEXT NOT NULL,
                weather_exposure TEXT NOT NULL,
                last_inspection_date TEXT,
                next_inspection_date TEXT,
                last_maintenance_date TEXT,
                open_reports_count INTEGER DEFAULT 0,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                path_coordinates TEXT,
                recommended_action TEXT,
                recommendation_reason TEXT,
                notes TEXT,
                updated_at TEXT NOT NULL
            );
            """)

            # 2. Issue Reports / Road Reports Table (Table A)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS issue_reports (
                id TEXT PRIMARY KEY,
                report_code TEXT,
                segment_id TEXT,
                road_name TEXT NOT NULL,
                category TEXT NOT NULL,
                severity TEXT NOT NULL,
                source TEXT NOT NULL,
                report_date TEXT NOT NULL,
                status TEXT NOT NULL,
                priority_score REAL DEFAULT 0,
                priority_level TEXT DEFAULT 'Medium',
                assigned_team TEXT,
                description TEXT,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                image_url TEXT,
                reporter_name TEXT,
                reporter_contact TEXT,
                verified_by TEXT,
                status_history TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            """)

            # 3. Road Assessments Table (Table B)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS road_assessments (
                id TEXT PRIMARY KEY,
                report_id TEXT,
                road_segment_id TEXT,
                urgency_score REAL NOT NULL,
                risk_category TEXT NOT NULL,
                recommended_action TEXT NOT NULL,
                explanation TEXT NOT NULL,
                factors_json TEXT,
                assessment_method TEXT NOT NULL,
                model_version TEXT,
                assessed_at TEXT NOT NULL
            );
            """)

            # 4. Maintenance Records Table (Table C)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS maintenance_records (
                id TEXT PRIMARY KEY,
                road_segment_id TEXT,
                report_id TEXT,
                road_name TEXT NOT NULL,
                ward TEXT,
                title TEXT NOT NULL,
                maintenance_type TEXT NOT NULL,
                priority TEXT NOT NULL,
                inspection_status TEXT DEFAULT 'Pending',
                repair_status TEXT DEFAULT 'Pending',
                assigned_team TEXT,
                crew_leader TEXT,
                estimated_cost REAL DEFAULT 0,
                start_date TEXT,
                target_completion_date TEXT,
                actual_completion_date TEXT,
                required_resources TEXT,
                notes TEXT,
                budget_status TEXT DEFAULT 'Within Allocation',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            """)

            # 5. Inspections Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS inspections (
                id TEXT PRIMARY KEY,
                segment_id TEXT NOT NULL,
                road_name TEXT NOT NULL,
                ward TEXT NOT NULL,
                assigned_inspector TEXT NOT NULL,
                inspector_role TEXT NOT NULL,
                scheduled_date TEXT NOT NULL,
                type TEXT NOT NULL,
                priority TEXT NOT NULL,
                status TEXT NOT NULL,
                notes TEXT,
                findings TEXT,
                created_at TEXT NOT NULL
            );
            """)

            # 6. Predictions & Recommendations Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS road_predictions (
                segment_id TEXT PRIMARY KEY,
                road_name TEXT NOT NULL,
                ward TEXT NOT NULL,
                urgency_score REAL NOT NULL,
                risk_category TEXT NOT NULL,
                predicted_risk REAL,
                confidence_score REAL NOT NULL,
                uncertainty_margin TEXT NOT NULL,
                recommended_action TEXT NOT NULL,
                factors_json TEXT NOT NULL,
                explanation_json TEXT NOT NULL,
                model_version TEXT NOT NULL,
                scoring_version TEXT NOT NULL,
                scored_at TEXT NOT NULL
            );
            """)

            # 7. Scoring Configurations Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS scoring_configs (
                version TEXT PRIMARY KEY,
                damage_severity REAL NOT NULL,
                recent_report_frequency REAL NOT NULL,
                traffic_intensity REAL NOT NULL,
                weather_exposure REAL NOT NULL,
                time_since_last_repair REAL NOT NULL,
                historical_deterioration REAL NOT NULL,
                critical_min REAL NOT NULL,
                high_min REAL NOT NULL,
                medium_min REAL NOT NULL,
                low_min REAL NOT NULL,
                updated_by TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                is_active INTEGER DEFAULT 1
            );
            """)

            # 8. Audit Logs Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                user TEXT NOT NULL,
                action TEXT NOT NULL,
                details TEXT NOT NULL
            );
            """)

            # Indexes
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_roads_priority ON road_segments(priority);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_roads_ward ON road_segments(ward);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_reports_segment ON issue_reports(segment_id);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_predictions_score ON road_predictions(urgency_score DESC);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_records(repair_status);")

            # Column migrations for existing SQLite databases
            if not self.is_postgres:
                cursor.execute("PRAGMA table_info(issue_reports)")
                existing_cols = [r[1] for r in cursor.fetchall()]
                if "report_code" not in existing_cols:
                    cursor.execute("ALTER TABLE issue_reports ADD COLUMN report_code TEXT")
                if "priority_score" not in existing_cols:
                    cursor.execute("ALTER TABLE issue_reports ADD COLUMN priority_score REAL DEFAULT 0")
                if "priority_level" not in existing_cols:
                    cursor.execute("ALTER TABLE issue_reports ADD COLUMN priority_level TEXT DEFAULT 'Medium'")
                if "updated_at" not in existing_cols:
                    cursor.execute("ALTER TABLE issue_reports ADD COLUMN updated_at TEXT")

            # Insert default active scoring configuration if not exists
            cursor.execute("SELECT COUNT(*) as cnt FROM scoring_configs;")
            row = cursor.fetchone()
            cnt = row["cnt"] if isinstance(row, dict) or hasattr(row, "__getitem__") else row[0]
            if cnt == 0:
                now_str = datetime.now().isoformat()
                cursor.execute("""
                INSERT INTO scoring_configs (
                    version, damage_severity, recent_report_frequency, traffic_intensity,
                    weather_exposure, time_since_last_repair, historical_deterioration,
                    critical_min, high_min, medium_min, low_min, updated_by, updated_at, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
                """, (
                    "v2.4-DefaultConfig",
                    0.40, 0.25, 0.15, 0.10, 0.10, 0.00,
                    80.0, 60.0, 40.0, 0.0,
                    "System Initialization",
                    now_str
                ))

            conn.commit()

db = Database()
