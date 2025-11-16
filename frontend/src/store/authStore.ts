import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * User Role Enum (matching backend)
 */
export enum UserRole {
  ADMIN_APPLICATION = 'admin_application',
  ADMIN_INSTITUTION = 'admin_institution',
  WORKER = 'worker',
}

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  role: UserRole;
  institutionId?: string;
  patientId?: string; // For workers - their assigned patient
  isVerified: boolean;
  isActive: boolean;
}

/**
 * Auth State
 *
 * SECURITY NOTE: Tokens are NOT stored in localStorage (XSS vulnerability).
 * Tokens are stored in HTTP-Only cookies set by the backend.
 * Only user data is persisted to localStorage.
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

/**
 * Auth Store using Zustand
 * Persisted to localStorage (only user data, NOT tokens)
 *
 * SECURITY: Tokens are in HTTP-Only cookies (backend-controlled)
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'medweg-auth-storage', // Only stores user object
    }
  )
);
