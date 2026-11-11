import httpClient from '../httpClient';
import { ENDP_ADMIN } from '../URLs';

export const getAdminsRequest = async () => {
  return (await httpClient.get(ENDP_ADMIN)).data;
};

export const createAdminRequest = async (data: any) => {
  return (await httpClient.post(ENDP_ADMIN, data)).data;
};

export const deleteAdminRequest = async (id: number) => {
  return (await httpClient.delete(`${ENDP_ADMIN}/${id}`)).data;
};

export const adminMeRequest = async () => {
  return (await httpClient.get(`${ENDP_ADMIN}/me`)).data;
};

export const adminLoginRequest = async (data: { phone: string; password: string }) => {
  return (await httpClient.post(`${ENDP_ADMIN}/login`, data)).data;
};

export const refreshAdminTokenRequest = async (refreshToken: string) => {
  return (await httpClient.post(`${ENDP_ADMIN}/refresh`, { refreshToken })).data;
};
