import client from './client';

/**
 * Contact API
 * Public endpoints for landing page contact form
 */

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
}

/**
 * Submit contact form
 * POST /api/v1/contact
 */
export const submitContactForm = async (data: ContactFormData): Promise<ContactFormResponse> => {
  const response = await client.post<ContactFormResponse>('/contact', data);
  return response.data;
};
