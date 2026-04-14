import api from '../utils/api';

export interface Product {
  id: string;
  name_en: string;
  name_es: string;
  description_en: string;
  description_es: string;
  price: number;
  stockQuantity: number;
  stockStatus?: 'IN_STOCK' | 'OUT_OF_STOCK';
  isActive: boolean;
  category: string;
  size?: string | null;
  color?: string | null;
  imageUrls: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductQueryParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
}

export interface CreateProductDto {
  name_en: string;
  name_es: string;
  description_en: string;
  description_es: string;
  price: number;
  stockQuantity: number;
  category: string;
  size?: string | null;
  color?: string | null;
  imageUrls: string[];
}

export interface UpdateProductDto {
  name_en?: string;
  name_es?: string;
  description_en?: string;
  description_es?: string;
  price?: number;
  stockQuantity?: number;
  category?: string;
  size?: string | null;
  color?: string | null;
  imageUrls?: string[];
}

export interface UpdateInventoryDto {
  stockQuantity: number;
}

const unwrapResponse = <T>(data: any, fallback: T): T => {
  if (Array.isArray(data)) return data as T;
  if (data?.data !== undefined) return data.data as T;
  if (data !== undefined) return data as T;
  return fallback;
};

export const getProducts = async (
  params?: ProductQueryParams
): Promise<Product[]> => {
  const res = await api.get('/products', { params });
  return unwrapResponse<Product[]>(res.data, []);
};

export const getInventoryView = async (): Promise<Product[]> => {
  const res = await api.get('/products/inventory');
  return unwrapResponse<Product[]>(res.data, []);
};

export const getProductById = async (id: string): Promise<Product> => {
  const res = await api.get(`/products/${id}`);
  return unwrapResponse<Product>(res.data, {} as Product);
};

export const createProduct = async (
  data: CreateProductDto
): Promise<Product> => {
  const res = await api.post('/products', data);
  return unwrapResponse<Product>(res.data, {} as Product);
};

export const updateProduct = async (
  id: string,
  data: UpdateProductDto
): Promise<Product> => {
  const res = await api.put(`/products/${id}`, data);
  return unwrapResponse<Product>(res.data, {} as Product);
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};

export const updateInventory = async (
  id: string,
  data: UpdateInventoryDto
): Promise<Product> => {
  const res = await api.patch(`/products/${id}/inventory`, data);
  return unwrapResponse<Product>(res.data, {} as Product);
};