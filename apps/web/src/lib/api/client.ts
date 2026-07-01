import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getSupabaseClient } from '@/lib/supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor — attach Supabase access token ────────────────────────
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  return config;
});

// ── Response interceptor — handle 401, auto-refresh ───────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const supabase = getSupabaseClient();
      const { data, error: refreshError } = await supabase.auth.refreshSession();

      if (!refreshError && data.session) {
        originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`;
        return apiClient(originalRequest);
      }

      // Refresh failed — redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  },
);

// ── Typed API helpers ─────────────────────────────────────────────────────────
export const authApi = {
  me: ()                    => apiClient.get('/auth/me'),
  logout: ()                => apiClient.post('/auth/logout'),
  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (password: string) => apiClient.post('/auth/reset-password', { password }),
  sendOtp: (phone: string)  => apiClient.post('/auth/otp/send', { phone }),
  verifyOtp: (phone: string, token: string) => apiClient.post('/auth/otp/verify', { phone, token }),
  resendVerification: (email: string) => apiClient.post('/auth/resend-verification', { email }),
};

export const usersApi = {
  getProfile: ()                    => apiClient.get('/users/profile'),
  updateProfile: (data: object)     => apiClient.patch('/users/profile', data),
};
