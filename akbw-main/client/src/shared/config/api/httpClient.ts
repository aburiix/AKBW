import axios from 'axios';
import { LanguageRoutes } from '../i18n/types';
import { BASE_URL } from './URLs';
import { useUserStore } from '@/shared/store/user.store';

export const getLocaleFromPathname = (): LanguageRoutes => {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
    if (localeMatch) {
      const locale = localeMatch[1];
      if (Object.values(LanguageRoutes).includes(locale as LanguageRoutes)) {
        return locale as LanguageRoutes;
      }
    }
  }
  return LanguageRoutes.UZ;
};

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
  (config) => {
    const language = getLocaleFromPathname();

    config.headers['Accept-Language'] = language;
    const accessToken = useUserStore.getState().token;
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
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
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return httpClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = useUserStore.getState().refreshToken;

        if (refreshToken) {
          const { refreshUserTokenRequest } =
            await import('./auth/auth.request');
          const response = await refreshUserTokenRequest(refreshToken);

          if (response.data.ok && response.data.token) {
            const { setToken } = useUserStore.getState();
            setToken(response.data.token, response.data.refreshToken);

            processQueue(null, response.data.token);
            originalRequest.headers['Authorization'] =
              `Bearer ${response.data.token}`;
            return httpClient(originalRequest);
          }
        }

        const { logout } = useUserStore.getState();
        logout();
        processQueue(error, null);
        return Promise.reject(error);
      } catch (refreshError) {
        const { logout } = useUserStore.getState();
        logout();
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default httpClient;
