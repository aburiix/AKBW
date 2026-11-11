import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAdminRequest,
  deleteAdminRequest,
  getAdminsRequest,
} from '@/shared/config/api/admin/admin.request';
import { toast } from 'sonner';
import { extractError } from '@/shared/lib/extractError';

export const useAdmins = () => {
  return useQuery({
    queryKey: ['admins'],
    queryFn: getAdminsRequest,
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
    onError: (error) => {
      toast.error(extractError(error) || 'Admin yaratishda xatolik yuz berdi');
    },
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success("Admin o'chirildi");
    },
    onError: (error) => {
      toast.error(extractError(error) || "O'chirishda xatolik yuz berdi");
    },
  });
};
