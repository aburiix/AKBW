import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCouponsRequest,
  createCouponRequest,
  updateCouponRequest,
  deleteCouponRequest,
} from '@/shared/config/api/coupon/coupon.request';

import {
  ICreateCoupon,
  IUpdateCoupon,
} from '@/shared/config/api/coupon/coupon.model';
import { toast } from 'sonner';
import { extractError } from '@/shared/lib/extractError';

export const useCoupons = () => {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: () => getCouponsRequest(),
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (coupon: ICreateCoupon) =>
      createCouponRequest(coupon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Kupon muvaffaqiyatli yaratildi');
    },
    onError: (error) => {
      toast.error(extractError(error) || 'Kupon yaratishda xatolik yuz berdi');
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (coupon: IUpdateCoupon) =>
      updateCouponRequest(coupon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Kupon muvaffaqiyatli yangilandi');
    },
    onError: (error) => {
      toast.error(extractError(error) || 'Kupon yangilashda xatolik yuz berdi');
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCouponRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Kupon muvaffaqiyatli o‘chirildi');
    },
    onError: (error) => {
      toast.error(extractError(error) || 'Kupon o‘chirishda xatolik yuz berdi');
    },
  });
};
