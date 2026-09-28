import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

import DashboardPage from "../pages/DashboardPage";
import ResumePage from "../pages/ResumePage";
import JobsPage from "../pages/JobsPage";
import InterviewsPage from "../pages/InterviewsPage";
import ProgressPage from "../pages/ProgressPage";
import ApplicationsPage from "../pages/ApplicationsPage";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated application */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/resume" element={<ResumePage />} />

          <Route path="/jobs" element={<JobsPage />} />

          <Route path="/interviews" element={<InterviewsPage />} />

          <Route path="/progress" element={<ProgressPage />} />

          <Route path="/applications" element={<ApplicationsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
