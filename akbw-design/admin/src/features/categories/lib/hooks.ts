import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCategoriesRequest,
  createCategoriesRequest,
  updateCategoriesRequest,
  deleteCategoriesRequest,
  getCategoryByIdRequest,
} from '@/shared/config/api/product/product.request';

import {
  ICreateCategory,
  ICreateCategoryTranslation,
} from '@/shared/config/api/product/product.model';
import { toast } from 'sonner';
import { extractError } from '@/shared/lib/extractError';

export const useCategories = (q?: string) => {
  return useQuery({
    queryKey: ['categories', q],
    queryFn: () => getCategoriesRequest(q),
  });
};

export const useCategory = (id?: number) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => getCategoryByIdRequest(id!),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category: ICreateCategory) =>
      createCategoriesRequest(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kategoriya muvaffaqiyatli yaratildi');
    },
    onError: (error) => {
      toast.error(extractError(error) || 'Kategoriya yaratishda xatolik yuz berdi');
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category: { id: number } & Partial<ICreateCategory>) =>
      updateCategoriesRequest(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kategoriya muvaffaqiyatli yangilandi');
    },
    onError: (error) => {
      toast.error(extractError(error) || 'Kategoriya yangilashda xatolik yuz berdi');
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCategoriesRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kategoriya muvaffaqiyatli o‘chirildi');
    },
    onError: (error) => {
      toast.error(extractError(error) || 'Kategoriya o‘chirishda xatolik yuz berdi');
    },
  });
};
