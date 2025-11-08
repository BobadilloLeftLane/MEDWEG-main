import { Navigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '../../store/authStore';
import { ReactNode } from 'react';

interface PublicRouteProps {
  children: ReactNode;
}

/**
 * PublicRoute Component
 *
 * Ruta za javne stranice (Login, Register) koja:
 * 1. Proverava da li je korisnik već ulogovan
 * 2. Ako jeste, redirektuje ga na njegov dashboard
 * 3. Ako nije, prikazuje javnu stranicu (login/register)
 *
 * Sprečava da ulogovani korisnici vide login stranicu.
 */
const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  // If user is already authenticated, redirect to their dashboard
  if (isAuthenticated && user) {
    const redirectPath = getRoleDashboard(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  // Not authenticated - show public page (login/register)
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

export default PublicRoute;
