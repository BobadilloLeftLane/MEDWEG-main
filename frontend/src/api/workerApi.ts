import apiClient, { ApiResponse } from './client';

/**
 * Worker API
 */

export interface Worker {
  id: string;
  username: string;
  patientId: string;
  institutionId: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface WorkerCredentials {
  worker: Worker;
  username: string;
  password: string;
}

/**
 * Generate worker credentials for a patient
 */
export const generateWorkerForPatient = async (patientId: string): Promise<WorkerCredentials> => {
  const response = await apiClient.post<ApiResponse<WorkerCredentials>>(`/workers/generate/${patientId}`);
  return response.data.data;
};

/**
 * Get worker by patient ID
 */
export const getWorkerByPatientId = async (patientId: string): Promise<Worker | null> => {
  try {
    const response = await apiClient.get<ApiResponse<Worker>>(`/workers/patient/${patientId}`);
    return response.data.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Get all workers for the institution
 */
export const getWorkers = async (): Promise<Worker[]> => {
  const response = await apiClient.get<ApiResponse<Worker[]>>('/workers');
  return response.data.data;
};

/**
 * Deactivate worker
 */
export const deactivateWorker = async (id: string): Promise<void> => {
  await apiClient.delete(`/workers/${id}`);
};

/**
 * Reset worker password
 */
export const resetWorkerPassword = async (id: string): Promise<{ newPassword: string }> => {
  const response = await apiClient.patch<ApiResponse<{ newPassword: string }>>(`/workers/${id}/reset-password`);
  return response.data.data;
};
