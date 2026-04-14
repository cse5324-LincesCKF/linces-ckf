import api from '../utils/api';

export interface OrderItemProduct {
  id: string;
  name_en: string;
  name_es: string;
  imageUrls: string[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  product: OrderItemProduct;
}

export interface Order {
  id: string;
  status: string;
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  items: OrderItem[];
}

const unwrapResponse = <T>(data: unknown, fallback: T): T => {
  if (typeof data === 'object' && data !== null && 'data' in data) {
    return (data as { data: T }).data;
  }

  if (data !== undefined) {
    return data as T;
  }

  return fallback;
};

export const createOrder = async (): Promise<Order> => {
  const res = await api.post('/orders', {});
  return unwrapResponse<Order>(res.data, {} as Order);
};

export const getOrderById = async (id: string): Promise<Order> => {
  const res = await api.get(`/orders/${id}`);
  return unwrapResponse<Order>(res.data, {} as Order);
};

export const getOrdersForUser = async (userId: string): Promise<Order[]> => {
  const res = await api.get(`/users/${userId}/orders`);
  return unwrapResponse<Order[]>(res.data, []);
};

export const updateOrderStatus = async (
  id: string,
  status: string
): Promise<Order> => {
  const res = await api.patch(`/orders/${id}/status`, { status });
  return unwrapResponse<Order>(res.data, {} as Order);
};