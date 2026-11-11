import httpClient from '../httpClient';
import { ENDP_FACTORY_WORKERS } from '../URLs';

export const getWorkersRequest = async () => {
  return (await httpClient.get(ENDP_FACTORY_WORKERS)).data;
};

export const createWorkerRequest = async (data: any) => {
  return (await httpClient.post(ENDP_FACTORY_WORKERS, data)).data;
};

export const updateWorkerRequest = async ({ id, ...data }: any) => {
  return (await httpClient.put(`${ENDP_FACTORY_WORKERS}/${id}`, data)).data;
};

export const deleteWorkerRequest = async (id: number) => {
  return (await httpClient.delete(`${ENDP_FACTORY_WORKERS}/${id}`)).data;
};
