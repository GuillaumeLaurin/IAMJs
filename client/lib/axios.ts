import { AccessTokenDto } from '@/dto/access-token.dto';
import { useAuthStore } from '@/store/auth.store';
import axios, { InternalAxiosRequestConfig } from 'axios';
import { navigateTo } from './navigate';

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: RetryConfig = error.config;

    const isRefresRequest = original.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !original._retry && !isRefresRequest) {
      original._retry = true;

      try {
        const { data } = await api.post<AccessTokenDto>('/auth/refresh');
        useAuthStore.getState().setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().clear();
        navigateTo('/login');
      }
    }

    return Promise.reject(error);
  },
);
