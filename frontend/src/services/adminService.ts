import api from '../utils/api';

export interface AdminDashboardSummary {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  openQuotes: number;
}

export interface AdminUser {
  id: string;
  name?: string;
  email: string;
  role: string;
  isActive: boolean;
  languagePreference?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminInventoryItem {
  id: string;
  name_en: string;
  name_es: string;
  stockQuantity: number;
  isActive: boolean;
  category: string;
  updatedAt?: string;
  price?: number;
  description_en?: string;
  description_es?: string;
  size?: string | null;
  color?: string | null;
  imageUrls?: string[];
  createdAt?: string;
}

export interface AuditLogItem {
  id?: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  createdAt?: string;
}

export interface AuditLogResponse {
  items: AuditLogItem[];
  total: number;
  page: number;
  limit: number;
}

const unwrapResponse = <T>(data: any, fallback: T): T => {
  if (data?.data !== undefined) return data.data as T;
  if (data !== undefined) return data as T;
  return fallback;
};

export const getAdminDashboard = async (): Promise<AdminDashboardSummary> => {
  const res = await api.get('/admin/dashboard');
  return unwrapResponse<AdminDashboardSummary>(res.data, {
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    openQuotes: 0,
  });
};

export const getAdminInventory = async (): Promise<AdminInventoryItem[]> => {
  const res = await api.get('/admin/inventory');
  return unwrapResponse<AdminInventoryItem[]>(res.data, []);
};

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const res = await api.get('/admin/users');
  return unwrapResponse<AdminUser[]>(res.data, []);
};

export const deactivateAdminUser = async (
  id: string,
  reason?: string
): Promise<{ id: string; isActive: boolean; message: string }> => {
  const res = await api.patch(`/admin/users/${id}/deactivate`, {
    reason,
  });
  return unwrapResponse<{ id: string; isActive: boolean; message: string }>(
    res.data,
    { id: '', isActive: false, message: '' }
  );
};

export const getAdminAuditLogs = async (
  page = 1,
  limit = 10
): Promise<AuditLogResponse> => {
  const res = await api.get('/admin/audit-logs', {
    params: { page, limit },
  });

  return unwrapResponse<AuditLogResponse>(res.data, {
    items: [],
    total: 0,
    page,
    limit,
  });
};