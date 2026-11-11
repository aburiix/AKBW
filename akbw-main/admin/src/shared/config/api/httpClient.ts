import getLocaleCS from '@/shared/lib/getLocaleCS';
import { getLocale } from 'next-intl/server';
import { LanguageRoutes } from '../i18n/types';
import { BASE_URL } from './URLs';
import axios from 'axios';
import { useAdminAuthStore } from '@/shared/store/auth.store';

const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

httpClient.interceptors.request.use(
  async (config) => {
    console.log(`API REQUEST to ${config.url}`, config);

    // Language configs
    let language = LanguageRoutes.UZ;
    if (typeof window === 'undefined') {
      try {
        language = (await getLocale()) as LanguageRoutes;
      } catch (e) {
        console.log('error', e);
      }
    } else {
      language = getLocaleCS() || LanguageRoutes.UZ;
    }

    config.headers['Accept-Language'] = language;

    const authStorage = localStorage.getItem('admin-auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state.adminToken && typeof state.adminToken === 'string' && state.adminToken.length > 0) {
          config.headers['Authorization'] = `Bearer ${state.adminToken}`;
        }
      } catch (e) {
        console.error('Error parsing auth storage', e);
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return httpClient(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const authStorage = localStorage.getItem('admin-auth-storage');
        if (authStorage) {
          const { state } = JSON.parse(authStorage);
          const refreshToken = state.refreshToken;

          if (refreshToken) {
            const { refreshAdminTokenRequest } = await import('./admin/admin.request');
            const response = await refreshAdminTokenRequest(refreshToken);

            if (response.ok && response.token) {
              const { setAdminToken } = useAdminAuthStore.getState();
              setAdminToken(response.token, response.refreshToken, undefined, false);

              processQueue(null, response.token);
              originalRequest.headers['Authorization'] = `Bearer ${response.token}`;
              return httpClient(originalRequest);
            }
          }
        }

        const { logout } = useAdminAuthStore.getState();
        logout();
        processQueue(error, null);
        return Promise.reject(error);
      } catch (refreshError) {
        const { logout } = useAdminAuthStore.getState();
        logout();
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    console.error('API error:', error);
    return Promise.reject(error);
  },
);

export default httpClient;
