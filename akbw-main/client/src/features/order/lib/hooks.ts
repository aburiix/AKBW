import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderRequest } from '@/shared/config/api/order/order.request';
import { ICreateOrderRequest } from '@/shared/config/api/order/order.model';
import { useTranslations } from 'next-intl';
import { toast } from '@/shared/ui/toast';
import { onError } from '@/shared/config/api/isAxiosError';

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => orderRequest.getAll(),
  });
};

export const useCreateOrder = () => {
  const t = useTranslations('Cart');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ICreateOrderRequest) => orderRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (_err) => {
      toast.error(t('order_submit_error'));
    },
  });
};

export const usePaymeLink = () => {
  const t = useTranslations('Cart');
  return useMutation({
    mutationFn: (data: { orderId: number; amount: number }) =>
      orderRequest.getPaymeLink(data.orderId, data.amount),
    onError: (err) => onError(err, t('order_submit_error')),
    onSuccess: (data) => {
      if (data.link) {
        window.location.replace(data.link);
      }
    },
  });
};
