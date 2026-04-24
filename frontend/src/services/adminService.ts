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

/**
 * Utility to handle nested data structures from the API response
 */
const unwrapResponse = <T>(data: unknown, fallback: T): T => {
  if (typeof data === 'object' && data !== null && 'data' in data) {
    return (data as { data: T }).data;
  }

  if (data !== undefined) {
    return data as T;
  }

  return fallback;
};

/**
 * Fetches high-level stats for the Admin Dashboard cards.
 */
export const getAdminDashboard = async (): Promise<AdminDashboardSummary> => {
  try {
    const res = await api.get('/admin/dashboard');
    return unwrapResponse<AdminDashboardSummary>(res.data, {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      openQuotes: 0,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard summary:', error);
    throw error;
  }
};

/**
 * Fetches inventory items for administrative management.
 */
export const getAdminInventory = async (): Promise<AdminInventoryItem[]> => {
  try {
    const res = await api.get('/admin/inventory');
    return unwrapResponse<AdminInventoryItem[]>(res.data, []);
  } catch (error) {
    console.error('Error fetching admin inventory:', error);
    throw error;
  }
};

/**
 * Fetches all users for administrative management.
 */
export const getAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    const res = await api.get('/admin/users');
    return unwrapResponse<AdminUser[]>(res.data, []);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    throw error;
  }
};

/**
 * Deactivates a user account with an optional reason.
 */
export const deactivateAdminUser = async (
  id: string,
  reason?: string
): Promise<{ id: string; isActive: boolean; message: string }> => {
  try {
    const res = await api.patch(`/admin/users/${id}/deactivate`, {
      reason,
    });
    return unwrapResponse<{ id: string; isActive: boolean; message: string }>(
      res.data,
      { id: '', isActive: false, message: '' }
    );
  } catch (error) {
    console.error(`Error deactivating user ${id}:`, error);
    throw error;
  }
};

/**
 * Fetches paginated audit logs for security tracking.
 */
export const getAdminAuditLogs = async (
  page = 1,
  limit = 10
): Promise<AuditLogResponse> => {
  try {
    const res = await api.get('/admin/audit-logs', {
      params: { page, limit },
    });

    return unwrapResponse<AuditLogResponse>(res.data, {
      items: [],
      total: 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};