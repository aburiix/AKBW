import httpClient from '../httpClient';
import {
  ENDP_ORDER,
  ENDP_ORDER_STATUS
} from '../URLs';
import { IOrder } from './order.model';

export const orderRequest = {
  getAll: async () => {
    const response = await httpClient.get<{ data: IOrder[]; ok: boolean }>(
      ENDP_ORDER + '/all',
    );
    return response.data;
  },
  updateStatus: async (id: number, status: string) => {
    const response = await httpClient.patch<{ data: IOrder; ok: boolean }>(
      `/order/${id}/status`,
      { state: status },
    );
    return response.data;
  },
  getStatus: async () => {
    const response = await httpClient.get<{ data: string[]; ok: boolean }>(
      ENDP_ORDER_STATUS,
    );
    return response.data;
  },
};
