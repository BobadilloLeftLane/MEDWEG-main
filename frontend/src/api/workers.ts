import apiClient, { ApiResponse } from './client';

/**
 * Worker API
 * Handles worker credential generation and management
 */

/**
 * Worker Credentials Response
 */
export interface WorkerCredentials {
  username: string;
  password: string;
  workerId: string;
}

/**
 * Worker Info
 */
export interface Worker {
  id: string;
  username: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

/**
 * Generate worker credentials for a patient
 * POST /api/v1/workers/generate/:patientId
 */
export const generateWorkerForPatient = async (patientId: string): Promise<WorkerCredentials> => {
  const response = await apiClient.post<ApiResponse<WorkerCredentials>>(
    `/workers/generate/${patientId}`
  );
  return response.data.data;
};

/**
 * Get all workers for the institution
 * GET /api/v1/workers
 */
export const getWorkers = async (): Promise<Worker[]> => {
  const response = await apiClient.get<ApiResponse<Worker[]>>('/workers');
  return response.data.data;
};

/**
 * Deactivate a worker
 * DELETE /api/v1/workers/:workerId
 */
export const deactivateWorker = async (workerId: string): Promise<void> => {
  await apiClient.delete(`/workers/${workerId}`);
};

/**
 * Reset worker password
 * PATCH /api/v1/workers/:workerId/reset-password
 */
export const resetWorkerPassword = async (workerId: string): Promise<string> => {
  const response = await apiClient.patch<ApiResponse<{ newPassword: string }>>(
    `/workers/${workerId}/reset-password`
  );
  return response.data.data.newPassword;
};

/**
 * Get worker by patient ID
 * GET /api/v1/workers/patient/:patientId
 */
export const getWorkerByPatientId = async (patientId: string): Promise<Worker | null> => {
  try {
    const response = await apiClient.get<ApiResponse<Worker>>(
      `/workers/patient/${patientId}`
    );
    return response.data.data;
  } catch (error: any) {
    // Return null if worker not found (404)
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export default {
  generateWorkerForPatient,
  getWorkers,
  deactivateWorker,
  resetWorkerPassword,
  getWorkerByPatientId,
};
