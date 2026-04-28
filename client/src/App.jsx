/**
 * client/src/App.jsx  (v3 — PRD-compliant)
 * ───────────────────────────────────────────
 * Routes:
 *   /           → Landing
 *   /login      → Login (3-tab: Student, Staff, Admin)
 *   /dashboard  → StudentDashboard (students only)
 *   /staff      → StaffDashboard (staff/hod only)
 *   /admin      → AdminDashboard (admin only)
 *
 * NO registration routes.
 * Note: BrowserRouter + AuthProvider are in main.jsx — not duplicated here.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing        from './pages/Landing';
import Login          from './pages/Login';
import Dashboard      from './pages/Dashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children, allowRoles }) {
  const { isLoggedIn, user } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (allowRoles && !allowRoles.includes(user?.role) && !allowRoles.includes(user?.portal)) {
    // Redirect to their correct dashboard
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'staff' || user?.role === 'hod' || user?.portal === 'staff') return <Navigate to="/staff" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Student Dashboard */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowRoles={['student']}>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* Staff / HoD Dashboard */}
      <Route path="/staff" element={
        <ProtectedRoute allowRoles={['staff', 'hod']}>
          <StaffDashboard />
        </ProtectedRoute>
      } />
      <Route path="/staff/dashboard" element={<Navigate to="/staff" replace />} />

      {/* Admin Dashboard */}
      <Route path="/admin" element={
        <ProtectedRoute allowRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
