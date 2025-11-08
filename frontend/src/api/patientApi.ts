import apiClient, { ApiResponse } from './client';

/**
 * Patient API
 */

export interface Patient {
  id: string;
  uniqueCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
}

/**
 * Convert camelCase frontend fields to snake_case backend fields
 */
const convertToSnakeCase = (data: CreatePatientRequest | Partial<CreatePatientRequest>) => {
  return {
    first_name: data.firstName,
    last_name: data.lastName,
    date_of_birth: data.dateOfBirth,
    address: data.address,
  };
};

/**
 * Convert snake_case backend fields to camelCase frontend fields
 */
const convertToCamelCase = (data: any): Patient => {
  return {
    id: data.id,
    uniqueCode: data.unique_code,
    firstName: data.first_name,
    lastName: data.last_name,
    dateOfBirth: data.date_of_birth,
    address: data.address,
    isActive: data.is_active,
    createdAt: data.created_at,
  };
};

/**
 * Get all patients for the institution
 */
export const getPatients = async (): Promise<Patient[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>('/patients');
  return response.data.data.map(convertToCamelCase);
};

/**
 * Get patient by ID
 */
export const getPatientById = async (id: string): Promise<Patient> => {
  const response = await apiClient.get<ApiResponse<any>>(`/patients/${id}`);
  return convertToCamelCase(response.data.data);
};

/**
 * Create new patient
 */
export const createPatient = async (data: CreatePatientRequest): Promise<Patient> => {
  const snakeCaseData = convertToSnakeCase(data);
  const response = await apiClient.post<ApiResponse<any>>('/patients', snakeCaseData);
  return convertToCamelCase(response.data.data);
};

/**
 * Update patient
 */
export const updatePatient = async (id: string, data: Partial<CreatePatientRequest>): Promise<Patient> => {
  const snakeCaseData = convertToSnakeCase(data);
  const response = await apiClient.put<ApiResponse<any>>(`/patients/${id}`, snakeCaseData);
  return convertToCamelCase(response.data.data);
};

/**
 * Deactivate patient (soft delete)
 */
export const deactivatePatient = async (id: string): Promise<void> => {
  await apiClient.delete(`/patients/${id}/deactivate`);
};

/**
 * Reactivate patient
 */
export const reactivatePatient = async (id: string): Promise<void> => {
  await apiClient.post(`/patients/${id}/reactivate`);
};

/**
 * Permanently delete patient (GDPR)
 */
export const deletePatient = async (id: string): Promise<void> => {
  await apiClient.delete(`/patients/${id}`);
};
