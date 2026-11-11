import httpClient from '../httpClient';
import { ENDP_COUPON_APPLY } from '../URLs';
import { IApplyCounponResponse } from './coupon.model';

export const applyCouponRequest = async ({
  code,
}: {
  code: string;
}): Promise<IApplyCounponResponse> => {
  const response = await httpClient.post(ENDP_COUPON_APPLY, {
    code: code,
  });

  return response.data;
};
