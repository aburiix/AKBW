import httpClient from '../httpClient';
import { ENDP_DELIVERY_CALCULATE } from '../URLs';
import { IDeliveryCalculateRequest } from './delivery.model';

export const calculateDelivery = async (data: IDeliveryCalculateRequest) => {
  return (await httpClient.post(ENDP_DELIVERY_CALCULATE, data)).data;
};
