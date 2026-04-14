import api from '../utils/api';

export interface QuoteSubmittedBy {
  id: string;
  email: string;
  name: string;
}

export interface Quote {
  id: string;
  submittedBy: QuoteSubmittedBy;
  quantity: number;
  materialType: string;
  desiredDeliveryDate: string;
  customizationDescription: string;
  supportingDocumentUrl: string | null;
  status: string;
  convertedToOrderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuoteDto {
  quantity: number;
  materialType: string;
  desiredDeliveryDate: string;
  customizationDescription: string;
  supportingDocumentUrl?: string;
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

export const createQuote = async (data: CreateQuoteDto): Promise<Quote> => {
  const res = await api.post('/quotes', data);
  return unwrapResponse<Quote>(res.data, {} as Quote);
};

export const getQuotes = async (): Promise<Quote[]> => {
  const res = await api.get('/quotes');
  return unwrapResponse<Quote[]>(res.data, []);
};

export const getQuoteById = async (id: string): Promise<Quote> => {
  const res = await api.get(`/quotes/${id}`);
  return unwrapResponse<Quote>(res.data, {} as Quote);
};

export const updateQuoteStatus = async (
  id: string,
  status: string
): Promise<Quote> => {
  const res = await api.patch(`/quotes/${id}/status`, { status });
  return unwrapResponse<Quote>(res.data, {} as Quote);
};

export const convertQuote = async (
  id: string
): Promise<{ quote: Quote; orderId: string; message: string }> => {
  const res = await api.post(`/quotes/${id}/convert`, {});
  return unwrapResponse<{ quote: Quote; orderId: string; message: string }>(
    res.data,
    { quote: {} as Quote, orderId: '', message: '' }
  );
};