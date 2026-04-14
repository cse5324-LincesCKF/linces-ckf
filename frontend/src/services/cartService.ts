import api from '../utils/api';

export interface CartItemProduct {
  id: string;
  name_en: string;
  name_es: string;
  price: number;
  imageUrls: string[];
  stockQuantity: number;
}

export interface CartItem {
  id: string;
  quantity: number;
  product: CartItemProduct;
  lineTotal: number;
}

export interface CartResponse {
  id: string;
  updatedAt: string;
  items: CartItem[];
  totals: {
    subtotal: number;
    itemCount: number;
  };
}

export interface AddCartItemDto {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

const unwrapResponse = <T>(data: any, fallback: T): T => {
  if (data?.data !== undefined) return data.data as T;
  if (data !== undefined) return data as T;
  return fallback;
};

export const getCart = async (): Promise<CartResponse> => {
  const res = await api.get('/cart');
  return unwrapResponse<CartResponse>(res.data, {
    id: '',
    updatedAt: '',
    items: [],
    totals: {
      subtotal: 0,
      itemCount: 0,
    },
  });
};

export const addCartItem = async (
  data: AddCartItemDto
): Promise<CartResponse> => {
  const res = await api.post('/cart/items', data);
  return unwrapResponse<CartResponse>(res.data, {
    id: '',
    updatedAt: '',
    items: [],
    totals: {
      subtotal: 0,
      itemCount: 0,
    },
  });
};

export const updateCartItem = async (
  itemId: string,
  data: UpdateCartItemDto
): Promise<CartResponse> => {
  const res = await api.put(`/cart/items/${itemId}`, data);
  return unwrapResponse<CartResponse>(res.data, {
    id: '',
    updatedAt: '',
    items: [],
    totals: {
      subtotal: 0,
      itemCount: 0,
    },
  });
};

export const removeCartItem = async (
  itemId: string
): Promise<CartResponse> => {
  const res = await api.delete(`/cart/items/${itemId}`);
  return unwrapResponse<CartResponse>(res.data, {
    id: '',
    updatedAt: '',
    items: [],
    totals: {
      subtotal: 0,
      itemCount: 0,
    },
  });
};