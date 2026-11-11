import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getWorkersRequest,
  createWorkerRequest,
  updateWorkerRequest,
  deleteWorkerRequest,
} from '@/shared/config/api/factory/worker.requests';
import { toast } from 'sonner';

export const useGetWorkers = () => {
  return useQuery({
    queryKey: ['workers'],
    queryFn: getWorkersRequest,
  });
};

export const useCreateWorker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkerRequest,
    onSuccess: (data) => {
      if (data.ok) {
        toast.success(data.message || "Ishchi muvaffaqiyatli qo'shildi");
        queryClient.invalidateQueries({ queryKey: ['workers'] });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    },
  });
};

export const useUpdateWorker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateWorkerRequest,
    onSuccess: (data) => {
      if (data.ok) {
        toast.success(data.message || "Ishchi ma'lumotlari yangilandi");
        queryClient.invalidateQueries({ queryKey: ['workers'] });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    },
  });
};

export const useDeleteWorker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkerRequest,
    onSuccess: (data) => {
      if (data.ok) {
        toast.success(data.message || "Ishchi o'chirildi");
        queryClient.invalidateQueries({ queryKey: ['workers'] });
      }
    },
    onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    },
  });
};
