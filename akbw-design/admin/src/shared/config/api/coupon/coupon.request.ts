import httpClient from '../httpClient';
import { ENDP_COUPON } from '../URLs';
import { ICoupon, ICreateCoupon, IUpdateCoupon } from './coupon.model';

export const getCouponsRequest = async (): Promise<ICoupon[]> => {
  return (await httpClient.get(ENDP_COUPON)).data;
};

export const createCouponRequest = async (
  coupon: ICreateCoupon,
): Promise<ICoupon> => {
  return (await httpClient.post(ENDP_COUPON, coupon)).data;
};

export const updateCouponRequest = async (
  coupon: IUpdateCoupon,
): Promise<ICoupon> => {
  const { id, ...data } = coupon;
  return (await httpClient.put(`${ENDP_COUPON}/${id}`, data)).data;
};

export const deleteCouponRequest = async (id: number): Promise<void> => {
  return await httpClient.delete(`${ENDP_COUPON}/${id}`);
};
