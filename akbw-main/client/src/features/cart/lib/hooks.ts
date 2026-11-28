import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getRegionsRequest,
  getCitiesRequest,
  getBranchesRequest,
} from '@/shared/config/api/bts/bts.requests';
import { applyCouponRequest } from '@/shared/config/api/coupon/coupon.request';
import { useTranslations } from 'next-intl';
import { IGetBranchesRequest } from '@/shared/config/api/bts/bts.model';
import { calculateDelivery } from '@/shared/config/api/delivery/delivery.requests';
import { onError } from '@/shared/config/api/isAxiosError';
import {
  getClickLink,
  getPaymeLink,
  getPaynetLink,
} from '@/shared/config/api/checkout/checkout.requests';
import { openExternal } from '@/shared/lib/telegram';

export const useBtsRegions = () => {
  return useQuery({
    queryKey: ['bts-regions'],
    queryFn: getRegionsRequest,
  });
};

export const useBtsCities = (regionCode: string) => {
  return useQuery({
    queryKey: ['bts-cities', regionCode],
    queryFn: () => getCitiesRequest(regionCode),
    enabled: !!regionCode,
  });
};

export const useApplyCoupon = () => {
  return useMutation({
    mutationKey: ['apply-coupon'],
    mutationFn: applyCouponRequest,
    // xato xabari savat sahifasida (sabab bilan) ko'rsatiladi
  });
};

export const useGetBranches = (body: IGetBranchesRequest) => {
  return useQuery({
    queryKey: ['bts-branches', body],
    queryFn: () => getBranchesRequest(body),
    enabled: !!body.regionCode && !!body.cityCode,
  });
};

export const useCalculateDelivery = () => {
  return useMutation({
    mutationKey: ['calculate-delivery'],
    mutationFn: calculateDelivery,
  });
};

export const usePaymeLink = () => {
  const t = useTranslations('Cart');
  return useMutation({
    mutationFn: (data: { orderId: number; amount: number }) =>
      getPaymeLink(data.orderId, data.amount),
    onError: (err) => onError(err, t('order_submit_error')),
  });
};

export const useClickLink = () => {
  const t = useTranslations('Cart');
  return useMutation({
    mutationFn: (data: { orderId: string; amount: number }) =>
      getClickLink(data.orderId, data.amount),
    onError: (err) => onError(err, t('order_submit_error')),
    onSuccess: (data) => {
      if (data.link) {
        openExternal(data.link);
      }
    },
  });
};

export const usePaynetLink = () => {
  const t = useTranslations('Cart');
  return useMutation({
    mutationFn: (data: { orderId: string; amount: number }) =>
      getPaynetLink(data.orderId, data.amount),
    onError: (err) => onError(err, t('order_submit_error')),
    onSuccess: (data) => {
      if (data.link) {
        openExternal(data.link);
      }
    },
  });
};
