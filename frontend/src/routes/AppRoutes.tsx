import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import ResumePage from "../pages/ResumePage";
import JobsPage from "../pages/JobsPage";
import InterviewsPage from "../pages/InterviewsPage";

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected application */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/resume" element={<ResumePage />} />
  <Route path="/jobs" element={<JobsPage />} />
  <Route path="interviews" element={<InterviewsPage />} />
</Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;