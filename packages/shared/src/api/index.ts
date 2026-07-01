import axios, { AxiosInstance } from 'axios';

export interface TokenStorage {
  getToken: () => string | null | Promise<string | null>;
  setToken: (token: string | null) => void | Promise<void>;
}

let apiInstance: AxiosInstance | null = null;

export function configureApiClient(
  baseURL: string,
  storage: TokenStorage,
): AxiosInstance {
  apiInstance = axios.create({
    baseURL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });

  apiInstance.interceptors.request.use(async (config) => {
    const token = await Promise.resolve(storage.getToken());
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  apiInstance.interceptors.response.use(
    (res) => res,
    async (error) => {
      if (error.response?.status === 401) {
        await storage.setToken(null);
      }
      return Promise.reject(error);
    },
  );

  return apiInstance;
}

export function getApiClient(): AxiosInstance {
  if (!apiInstance) {
    throw new Error(
      'API client not configured. Call configureApiClient() at app startup.',
    );
  }
  return apiInstance;
}
