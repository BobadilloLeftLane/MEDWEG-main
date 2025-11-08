import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import PatientsPage from './pages/patients/PatientsPage';
import ProductsPage from './pages/products/ProductsPage';
import OrdersPage from './pages/orders/OrdersPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import InstitutionDashboard from './pages/institution/InstitutionDashboard';
import RecurringOrdersPage from './pages/institution/RecurringOrdersPage';
import CustomersPage from './pages/admin/CustomersPage';
import CalculatorPage from './pages/admin/CalculatorPage';
import WarehousePage from './pages/admin/WarehousePage';
import TransportPage from './pages/admin/TransportPage';
import DocumentationPage from './pages/admin/DocumentationPage';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import { UserRole } from './store/authStore';

function App() {
  return (
    <Routes>
      {/* ==================== PUBLIC ROUTES ==================== */}
      {/* Login page - redirects to dashboard if already authenticated */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Register page - redirects to dashboard if already authenticated */}
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* ==================== ADMIN APPLICATION ROUTES ==================== */}
      {/* Only accessible by ADMIN_APPLICATION role */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN_APPLICATION]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="calculator" element={<CalculatorPage />} />
        <Route path="warehouse" element={<WarehousePage />} />
        <Route path="transport" element={<TransportPage />} />
        <Route path="documentation" element={<DocumentationPage />} />
      </Route>

      {/* ==================== ADMIN INSTITUTION ROUTES ==================== */}
      {/* Only accessible by ADMIN_INSTITUTION role */}
      <Route
        path="/institution"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN_INSTITUTION]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/institution/dashboard" replace />} />
        <Route path="dashboard" element={<InstitutionDashboard />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="recurring-orders" element={<RecurringOrdersPage />} />
      </Route>

      {/* ==================== WORKER ROUTES ==================== */}
      {/* Only accessible by WORKER role */}
      <Route
        path="/worker/dashboard"
        element={
          <ProtectedRoute allowedRoles={[UserRole.WORKER]}>
            <WorkerDashboard />
          </ProtectedRoute>
        }
      />

      {/* ==================== LEGACY ROUTES (Backward Compatibility) ==================== */}
      {/* Protected - any authenticated user can access */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
      </Route>

      {/* ==================== FALLBACK ROUTES ==================== */}
      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 - Redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
