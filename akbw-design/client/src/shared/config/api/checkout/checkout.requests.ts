import httpClient from '../httpClient';

export const getPaymeLink = async (orderId: number, amount: number) => {
  const response = await httpClient.post<{ link: string; ok: boolean }>(
    '/payment/payme/generate-link',
    { orderId, amount },
  );
  return response.data;
};

export const getClickLink = async (orderId: string, amount: number) => {
  const response = await httpClient.post<{ link: string; ok: boolean }>(
    '/payment/click/checkout',
    { order_id: orderId, amount },
  );
  return response.data;
};

export const getPaynetLink = async (orderId: string, amount: number) => {
  const response = await httpClient.post<{ link: string; ok: boolean }>(
    '/payment/paynet/link',
    { orderId, amount },
  );
  return response.data;
};
