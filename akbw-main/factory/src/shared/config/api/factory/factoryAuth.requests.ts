import httpClient from '../httpClient';
import { ENDP_FACTORY_AUTH } from '../URLs';

export const registerFactoryRequest = async (data: any) => {
  return (await httpClient.post(`${ENDP_FACTORY_AUTH}/register`, data)).data;
};

export const loginFactoryRequest = async (data: any) => {
  return (await httpClient.post(`${ENDP_FACTORY_AUTH}/login`, data)).data;
};

export const getMeFactoryRequest = async () => {
  return (await httpClient.get(`${ENDP_FACTORY_AUTH}/me`)).data;
};
