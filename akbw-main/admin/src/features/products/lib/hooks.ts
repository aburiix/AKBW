import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  getProductsRequest,
  createProductRequest,
  updateProductRequest,
  deleteProductRequest,
  postProductToChannelRequest,
  getChannelStatusRequest,
} from '@/shared/config/api/product/product.request';
import type {
  ICreateProduct,
  IProductFilters,
} from '@/shared/config/api/product/product.model';
import { toast } from 'sonner';
import { extractError } from '@/shared/lib/extractError';

export const useProducts = (params: IProductFilters, enabled = true) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProductsRequest(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product: ICreateProduct) => createProductRequest(product),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Mahsulot muvaffaqiyatli yaratildi');
      reportChannel(data?.channel, 'Telegram kanalga yuborildi');
    },
    onError: (error) => {
      toast.error(extractError(error) || 'Mahsulot yaratishda xatolik yuz berdi');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product: { id: number } & Partial<ICreateProduct>) =>
      updateProductRequest(product),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Mahsulot muvaffaqiyatli yangilandi');
      reportChannel(data?.channel, 'Telegram kanaldagi post ham yangilandi');
    },
    onError: (error) => {
      toast.error(extractError(error) || 'Mahsulot yangilashda xatolik yuz berdi');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProductRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Mahsulot muvaffaqiyatli o‘chirildi');
    },
    onError: (error) => {
      toast.error(extractError(error) || 'Mahsulot o‘chirishda xatolik yuz berdi');
    },
  });
};

/** Server kanal natijasini qaytarsa — admin ko'radi (xato jim qolmaydi) */
const reportChannel = (channel: { ok: boolean; error?: string } | undefined, okText: string) => {
  if (!channel) return;
  if (channel.ok) toast.success(okText);
  else toast.error(`Kanalga yuborilmadi: ${channel.error ?? 'nomaʼlum xato'}`);
};

export const useChannelStatus = () =>
  useQuery({
    queryKey: ['channel-status'],
    queryFn: getChannelStatusRequest,
    staleTime: 5 * 60 * 1000,
  });

export const usePostToChannel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => postProductToChannelRequest(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(data?.message || 'Telegram kanalga yuborildi');
    },
    onError: (error) => {
      toast.error(extractError(error) || 'Kanalga yuborib bo‘lmadi');
    },
  });
};
