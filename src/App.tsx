import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

// Public Citizen & Auth Pages
import { PublicReportPage } from './pages/public/PublicReportPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Main Municipal Admin Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { MapPage } from './pages/map/MapPage';
import { RoadsPage } from './pages/roads/RoadsPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { InspectionsPage } from './pages/inspections/InspectionsPage';
import { PredictionsPage } from './pages/predictions/PredictionsPage';
import { MaintenancePage } from './pages/maintenance/MaintenancePage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { SettingsPage } from './pages/settings/SettingsPage';

// Single Role Protection: Municipal Authority Admin
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useApp();
  const token = localStorage.getItem('roadwatch_auth_token');

  if (!token && !currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Citizen Reporting (No Login Required) */}
          <Route path="/report" element={<PublicReportPage />} />
          <Route path="/public-report" element={<PublicReportPage />} />
          <Route path="/track" element={<PublicReportPage />} />

          {/* Authentication Route (Single Municipal Admin Role) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Municipal Authority Admin Shell */}
          <Route
            path="/"
            element={
              <ProtectedAdminRoute>
                <AppLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="predictions" element={<PredictionsPage />} />
            <Route path="inspections" element={<InspectionsPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="roads" element={<RoadsPage />} />
            <Route path="settings" element={<SettingsPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
