import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, UserRole } from '../../store/authStore';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

/**
 * ProtectedRoute Component
 *
 * Zaštićena ruta koja:
 * 1. Proverava da li je korisnik autentifikovan
 * 2. Proverava da li korisnik ima odgovarajuću rolu
 * 3. Redirektuje na /login ako nije autentifikovan
 * 4. Pokazuje "Access Denied" ako nema pravo pristupa
 *
 * @param children - Komponenta koja se prikazuje ako je pristup dozvoljen
 * @param allowedRoles - Array dozvoljenih rola (undefined = sve role)
 * @param requireAuth - Da li ruta zahteva autentifikaciju (default: true)
 */
const ProtectedRoute = ({
  children,
  allowedRoles,
  requireAuth = true
}: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // 1. Check authentication
  if (requireAuth && !isAuthenticated) {
    // Redirect to login, preserving the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check role-based access (if allowedRoles is specified)
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // User is authenticated but doesn't have permission
    // Redirect to their appropriate dashboard
    const redirectPath = getRoleDashboard(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  // 3. All checks passed - render the protected component
  return <>{children}</>;
};

/**
 * Helper: Get default dashboard path for a role
 */
const getRoleDashboard = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN_APPLICATION:
      return '/admin/dashboard';
    case UserRole.ADMIN_INSTITUTION:
      return '/institution/dashboard';
    case UserRole.WORKER:
      return '/worker/dashboard';
    default:
      return '/login';
  }
};

export default ProtectedRoute;
