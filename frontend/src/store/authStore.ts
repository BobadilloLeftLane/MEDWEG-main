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
 */
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

/**
 * Auth Store using Zustand
 * Persisted to localStorage
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'medweg-auth-storage',
    }
  )
);
