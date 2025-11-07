import apiClient from './client';

/**
 * Product API
 * API calls za product management
 */

export interface Product {
  id: string;
  name_de: string;
  description_de: string | null;
  type: 'gloves' | 'disinfectant_liquid' | 'disinfectant_wipes';
  size: 'S' | 'M' | 'L' | 'XL' | null;
  quantity_per_box: number;
  unit: string;
  price_per_unit: number;
  min_order_quantity: number;
  is_available: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProductDto {
  name_de: string;
  description_de?: string;
  type: 'gloves' | 'disinfectant_liquid' | 'disinfectant_wipes';
  size?: 'S' | 'M' | 'L' | 'XL';
  quantity_per_box: number;
  unit: string;
  price_per_unit: number;
  min_order_quantity: number;
  image_url?: string;
}

export interface UpdateProductDto {
  name_de?: string;
  description_de?: string;
  type?: 'gloves' | 'disinfectant_liquid' | 'disinfectant_wipes';
  size?: 'S' | 'M' | 'L' | 'XL' | null;
  quantity_per_box?: number;
  unit?: string;
  price_per_unit?: number;
  min_order_quantity?: number;
  image_url?: string;
}

export interface ProductFilters {
  type?: string;
  available_only?: boolean;
  search?: string;
}

/**
 * Get all products with optional filters
 */
export const getProducts = async (filters?: ProductFilters): Promise<Product[]> => {
  const params = new URLSearchParams();

  if (filters?.type) params.append('type', filters.type);
  if (filters?.available_only) params.append('available_only', 'true');
  if (filters?.search) params.append('search', filters.search);

  const response = await apiClient.get(`/products?${params.toString()}`);
  return response.data.data;
};

/**
 * Get product by ID
 */
export const getProductById = async (id: string): Promise<Product> => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data.data;
};

/**
 * Get all product types
 */
export const getProductTypes = async (): Promise<string[]> => {
  const response = await apiClient.get('/products/types');
  return response.data.data;
};

/**
 * Create new product (ADMIN_APP only)
 */
export const createProduct = async (data: CreateProductDto): Promise<Product> => {
  const response = await apiClient.post('/products', data);
  return response.data.data;
};

/**
 * Update product (ADMIN_APP only)
 */
export const updateProduct = async (id: string, data: UpdateProductDto): Promise<Product> => {
  const response = await apiClient.put(`/products/${id}`, data);
  return response.data.data;
};

/**
 * Set product availability (ADMIN_APP only)
 */
export const setProductAvailability = async (
  id: string,
  isAvailable: boolean
): Promise<void> => {
  await apiClient.patch(`/products/${id}/availability`, { is_available: isAvailable });
};

/**
 * Delete product permanently (ADMIN_APP only)
 */
export const deleteProduct = async (id: string): Promise<void> => {
  await apiClient.delete(`/products/${id}`);
};
