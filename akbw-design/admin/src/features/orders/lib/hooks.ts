import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderRequest } from '@/shared/config/api/order/order.request';
import { getOrderShipments } from '@/shared/config/api/shipment/shipment.requests';
import { getDeliveryFromToLinks } from '@/shared/config/api/delivery/delivery.requests';
import { toast } from 'sonner';
import { extractError } from '@/shared/lib/extractError';

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => orderRequest.getAll(),
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      orderRequest.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      toast.error(extractError(error) || 'Buyurtma holatini yangilashda xatolik yuz berdi');
    },
  });
};

export const useOrderStatus = () => {
  return useQuery({
    queryKey: ['order-status'],
    queryFn: () => orderRequest.getStatus(),
  });
};

export const useGetOrderShipments = (id?: string) => {
  return useQuery({
    queryKey: ['order-shipments', id],
    queryFn: () => getOrderShipments(id!),
    enabled: !!id,
  });
};

export const useGetDeliveryFromToLinks = () => {
  return useMutation({
    mutationKey: ['delivery-from-to-links'],
    mutationFn:getDeliveryFromToLinks,
  });
};