import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  getProductsRequest,
  createProductRequest,
  updateProductRequest,
  deleteProductRequest,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Mahsulot muvaffaqiyatli yaratildi');
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Mahsulot muvaffaqiyatli yangilandi');
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
