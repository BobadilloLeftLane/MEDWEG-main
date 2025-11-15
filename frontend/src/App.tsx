import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { UserRole } from './store/authStore';

// Eager load only authentication components for fast initial load
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Lazy load all other pages for better performance
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const CustomersPage = lazy(() => import('./pages/admin/CustomersPage'));
const WarehousePage = lazy(() => import('./pages/admin/WarehousePage'));
const TransportPage = lazy(() => import('./pages/admin/TransportPage'));
const DocumentationPage = lazy(() => import('./pages/admin/DocumentationPage'));
const CalculatorPage = lazy(() => import('./pages/admin/CalculatorPage'));
const InstitutionDashboard = lazy(() => import('./pages/institution/InstitutionDashboard'));
const RecurringOrdersPage = lazy(() => import('./pages/institution/RecurringOrdersPage'));
const PatientsPage = lazy(() => import('./pages/patients/PatientsPage'));
const ProductsPage = lazy(() => import('./pages/products/ProductsPage'));
const OrdersPage = lazy(() => import('./pages/orders/OrdersPage'));
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const WorkerDashboard = lazy(() => import('./pages/worker/WorkerDashboard'));

// Loading fallback component
const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress />
  </Box>
);

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
        <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
        <Route path="customers" element={<Suspense fallback={<PageLoader />}><CustomersPage /></Suspense>} />
        <Route path="products" element={<Suspense fallback={<PageLoader />}><ProductsPage /></Suspense>} />
        <Route path="orders" element={<Suspense fallback={<PageLoader />}><OrdersPage /></Suspense>} />
        <Route path="calculator" element={<Suspense fallback={<PageLoader />}><CalculatorPage /></Suspense>} />
        <Route path="warehouse" element={<Suspense fallback={<PageLoader />}><WarehousePage /></Suspense>} />
        <Route path="transport" element={<Suspense fallback={<PageLoader />}><TransportPage /></Suspense>} />
        <Route path="documentation" element={<Suspense fallback={<PageLoader />}><DocumentationPage /></Suspense>} />
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
        <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><InstitutionDashboard /></Suspense>} />
        <Route path="patients" element={<Suspense fallback={<PageLoader />}><PatientsPage /></Suspense>} />
        <Route path="products" element={<Suspense fallback={<PageLoader />}><ProductsPage /></Suspense>} />
        <Route path="orders" element={<Suspense fallback={<PageLoader />}><OrdersPage /></Suspense>} />
        <Route path="recurring-orders" element={<Suspense fallback={<PageLoader />}><RecurringOrdersPage /></Suspense>} />
      </Route>

      {/* ==================== WORKER ROUTES ==================== */}
      {/* Only accessible by WORKER role */}
      <Route
        path="/worker/dashboard"
        element={
          <ProtectedRoute allowedRoles={[UserRole.WORKER]}>
            <Suspense fallback={<PageLoader />}>
              <WorkerDashboard />
            </Suspense>
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
        <Route index element={<Suspense fallback={<PageLoader />}><DashboardHome /></Suspense>} />
        <Route path="patients" element={<Suspense fallback={<PageLoader />}><PatientsPage /></Suspense>} />
        <Route path="products" element={<Suspense fallback={<PageLoader />}><ProductsPage /></Suspense>} />
        <Route path="orders" element={<Suspense fallback={<PageLoader />}><OrdersPage /></Suspense>} />
      </Route>

      {/* ==================== FALLBACK ROUTES ==================== */}
      {/* Landing page - public home page */}
      <Route path="/" element={<LandingPage />} />

      {/* 404 - Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
