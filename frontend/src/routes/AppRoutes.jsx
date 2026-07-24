import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import authService from "../services/authService";
import DashboardLayout from "../layouts/DashboardLayout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import LiveMonitor from "../pages/LiveMonitor";
import GridHeatmap from "../pages/GridHeatmap";
import AlertsPage from "../pages/AlertsPage";
import RepairTickets from "../pages/RepairTickets";
import TechnicianManagement from "../pages/TechnicianManagement";
import Customers from "../pages/Customers";
import Reports from "../pages/Reports";
import TechnicianDashboard from "../pages/TechnicianDashboard";


const ProtectedRoute = ({ children }) => {
  const isAuth = authService.isAuthenticated();
  return isAuth ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ children, allowedRoles }) => {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  
  const hasAccess = allowedRoles.includes(user.role);
  return hasAccess ? children : <Navigate to="/" replace />;
};

const DashboardRedirect = () => {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "ROLE_TECHNICIAN" || user.role === "TECHNICIAN") {
    return <Navigate to="/tech-dashboard" replace />;
  }
  return <Dashboard />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {}
      <Route path="/login" element={<Login />} />

      {}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardRedirect />} />
        <Route 
          path="tech-dashboard" 
          element={
            <RoleRoute allowedRoles={["ADMIN", "TECHNICIAN", "ROLE_TECHNICIAN"]}>
              <TechnicianDashboard />
            </RoleRoute>
          } 
        />
        <Route path="monitoring" element={<LiveMonitor />} />
        <Route path="heatmap" element={<GridHeatmap />} />
        
        {}
        <Route 
          path="alerts" 
          element={
            <RoleRoute allowedRoles={["ADMIN", "OPERATOR"]}>
              <AlertsPage />
            </RoleRoute>
          } 
        />

        {}
        <Route path="tickets" element={<RepairTickets />} />

        {}
        <Route 
          path="technicians" 
          element={
            <RoleRoute allowedRoles={["ADMIN"]}>
              <TechnicianManagement />
            </RoleRoute>
          } 
        />

        {}
        <Route 
          path="customers" 
          element={
            <RoleRoute allowedRoles={["ADMIN", "OPERATOR"]}>
              <Customers />
            </RoleRoute>
          } 
        />

        {}
        <Route 
          path="reports" 
          element={
            <RoleRoute allowedRoles={["ADMIN", "OPERATOR"]}>
              <Reports />
            </RoleRoute>
          } 
        />
      </Route>

      {}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
export { ProtectedRoute, RoleRoute };
