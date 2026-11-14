import httpClient from '../httpClient';

export interface ITryOnItem {
  id: string;
  productId: number;
  resultUrl: string;
  createdAt: string;
}

export interface ITryOnMe {
  ok: boolean;
  enabled: boolean;
  limit: number;
  left: number;
  items: ITryOnItem[];
}

export interface ITryOnResult {
  ok: boolean;
  id: string;
  resultUrl: string;
  left: number;
}

export const getMyTryOnsRequest = async (): Promise<ITryOnMe> =>
  (await httpClient.get('/tryon/me')).data;

/** AI 5–30 soniya ishlaydi, shuning uchun timeout uzun */
export const createTryOnRequest = async (
  photo: Blob,
  productId: number,
  imageIndex = 0,
): Promise<ITryOnResult> => {
  const form = new FormData();
  form.append('photo', photo, 'photo.jpg');
  form.append('productId', String(productId));
  form.append('imageIndex', String(imageIndex));
  return (await httpClient.post('/tryon', form, { timeout: 120_000 })).data;
};

export const deleteTryOnRequest = async (id: string) =>
  (await httpClient.delete(`/tryon/${id}`)).data;
