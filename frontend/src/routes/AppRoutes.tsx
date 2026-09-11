import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import DashboardPage from '../pages/DashboardPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}

export default AppRoutes;