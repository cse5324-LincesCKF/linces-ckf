import api from '../utils/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  languagePreference: 'EN' | 'ES';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserDto {
  name?: string;
  languagePreference?: 'EN' | 'ES';
}

export interface UpdatePasswordDto {
  oldPassword: string;
  newPassword: string;
}

const unwrapResponse = <T>(data: any, fallback: T): T => {
  if (data?.data !== undefined) return data.data as T;
  if (data !== undefined) return data as T;
  return fallback;
};

export const getProfile = async (): Promise<UserProfile> => {
  const res = await api.get('/users/profile');
  return unwrapResponse<UserProfile>(res.data, {} as UserProfile);
};

export const updateUserProfile = async (
  id: string,
  data: UpdateUserDto
): Promise<UserProfile> => {
  const res = await api.put(`/users/${id}`, data);
  return unwrapResponse<UserProfile>(res.data, {} as UserProfile);
};

export const updatePassword = async (
  id: string,
  data: UpdatePasswordDto
): Promise<{ message: string }> => {
  const res = await api.put(`/users/${id}/password`, data);
  return unwrapResponse<{ message: string }>(res.data, { message: '' });
};

export const deleteAccount = async (
  id: string
): Promise<{ message: string }> => {
  const res = await api.delete(`/users/${id}`);
  return unwrapResponse<{ message: string }>(res.data, { message: '' });
};