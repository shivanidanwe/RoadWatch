import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Main Application Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { MapPage } from './pages/map/MapPage';
import { RoadsPage } from './pages/roads/RoadsPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { InspectionsPage } from './pages/inspections/InspectionsPage';
import { PredictionsPage } from './pages/predictions/PredictionsPage';
import { MaintenancePage } from './pages/maintenance/MaintenancePage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { DataExplorerPage } from './pages/data/DataExplorerPage';
import { TeamPage } from './pages/team/TeamPage';
import { ModelMonitoringPage } from './pages/models/ModelMonitoringPage';
import { DataSourcesPage } from './pages/settings/DataSourcesPage';
import { SettingsPage } from './pages/settings/SettingsPage';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Persistent Enterprise App Shell */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="roads" element={<RoadsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="inspections" element={<InspectionsPage />} />
            <Route path="predictions" element={<PredictionsPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="data" element={<DataExplorerPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="models" element={<ModelMonitoringPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="settings/data-sources" element={<DataSourcesPage />} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
