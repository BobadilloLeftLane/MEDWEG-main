import { User, UserRole, UserResponse } from '../types';

/**
 * User Model
 * Helper methods za User entitet
 */
export class UserModel {
  /**
   * Convert User to UserResponse (bez password_hash)
   */
  static toResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      institution_id: user.institution_id,
      is_verified: user.is_verified,
      is_active: user.is_active,
      created_at: user.created_at,
    };
  }

  /**
   * Check if user is Admin Application
   */
  static isAdminApp(user: User): boolean {
    return user.role === UserRole.ADMIN_APPLICATION;
  }

  /**
   * Check if user is Admin Institution
   */
  static isAdminInstitution(user: User): boolean {
    return user.role === UserRole.ADMIN_INSTITUTION;
  }

  /**
   * Check if user is Worker
   */
  static isWorker(user: User): boolean {
    return user.role === UserRole.WORKER;
  }

  /**
   * Validate user can perform action
   */
  static canPerformAction(user: User, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(user.role);
  }
}
