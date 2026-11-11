import httpClient from '../httpClient';
import {
  ICreateFactory,
  IFactory,
  IFactoryListResponse
} from './factory.model';
import {
  ENDP_FACTORY
} from '../URLs';

export const createFactoryRequest = async (factory: ICreateFactory): Promise<{ ok: boolean; factory: IFactory }> => {
  return (await httpClient.post(ENDP_FACTORY, factory)).data;
};

export const getFactoriesRequest = async (): Promise<IFactoryListResponse> => {
  return (await httpClient.get(ENDP_FACTORY)).data;
};

export const updateFactoryRequest = async (id: number, factory: ICreateFactory): Promise<{ ok: boolean; factory: IFactory }> => {
  return (await httpClient.patch(`${ENDP_FACTORY}/${id}`, factory)).data;
};

export const deleteFactoryRequest = async (id: number): Promise<{ ok: boolean }> => {
  return (await httpClient.delete(`${ENDP_FACTORY}/${id}`)).data;
};
