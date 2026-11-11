import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getStylesRequest,
  createStyleRequest,
  deleteStyleRequest,
} from '@/shared/config/api/style/style.request';
import { toast } from 'sonner';
import { extractError } from '@/shared/lib/extractError';

export const useStyles = () => {
  return useQuery({
    queryKey: ['styles'],
    queryFn: getStylesRequest,
  });
};

export const useCreateStyle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStyleRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['styles'] });
      toast.success('Stil yaratildi');
    },
    onError: (error) => {
      toast.error(extractError(error) || 'Stil yaratishda xatolik yuz berdi');
    },
  });
};

export const useDeleteStyle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStyleRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['styles'] });
      toast.success("Stil o'chirildi");
    },
    onError: (error) => {
      toast.error(extractError(error) || "O'chirishda xatolik yuz berdi");
    },
  });
};
