import apiClient from './client';

/**
 * Institution API
 * API calls for institution/customer management
 */

export interface Institution {
  id: string;
  name: string;
  address_plz: string;
  address_city: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get all institutions (admin_application only)
 */
export const getInstitutions = async (filters?: {
  isActive?: boolean;
  isVerified?: boolean;
}): Promise<Institution[]> => {
  const params = new URLSearchParams();

  if (filters?.isActive !== undefined) {
    params.append('isActive', filters.isActive.toString());
  }
  if (filters?.isVerified !== undefined) {
    params.append('isVerified', filters.isVerified.toString());
  }

  const response = await apiClient.get(`/institutions?${params.toString()}`);
  return response.data.data;
};

/**
 * Get institution by ID
 */
export const getInstitutionById = async (id: string): Promise<Institution> => {
  const response = await apiClient.get(`/institutions/${id}`);
  return response.data.data;
};

/**
 * Verify institution
 */
export const verifyInstitution = async (id: string): Promise<void> => {
  await apiClient.patch(`/institutions/${id}/verify`);
};

/**
 * Deactivate institution
 */
export const deactivateInstitution = async (id: string): Promise<void> => {
  await apiClient.patch(`/institutions/${id}/deactivate`);
};
