import httpClient from '../httpClient';
import { ENDP_LOGIN, ENDP_REGISTER, ENDP_AUTH_REFRESH } from '../URLs';
import type { LoginRequest, RegisterRequest } from './auth.model';

export const login = (data: LoginRequest) => {
  return httpClient.post(ENDP_LOGIN, data);
};

export const register = (data: RegisterRequest) => {
  return httpClient.post(ENDP_REGISTER, data);
};

export const refreshUserTokenRequest = (refreshToken: string) => {
  return httpClient.post(ENDP_AUTH_REFRESH, { refreshToken });
};
