import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createReviewRequest,
  getProductReviewsRequest,
  updateReviewRequest,
  getTopReviewsRequest,
} from '@/shared/config/api/review/review.request';
import { ICreateReviewRequest } from '@/shared/config/api/review/review.model';
import { toast } from '@/shared/ui/toast';

export const useProductReviews = (
  productId: number,
  page: number = 1,
  limit: number = 10,
) => {
  return useQuery({
    queryKey: ['reviews', productId, page, limit],
    queryFn: () => getProductReviewsRequest(productId, page, limit),
    enabled: !!productId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateReviewRequest) => createReviewRequest(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['reviews', variables.product_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['product', variables.product_id],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Şarh yaratişda xatolik yuz berdi';
      toast.error(errorMessage);
    },
  });
};
export const useUpdateReview = (reviewId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateReviewRequest) =>
      updateReviewRequest(reviewId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['reviews', variables.product_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['product', variables.product_id],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Şarh yangilaşda xatolik yuz berdi';
      toast.error(errorMessage);
    },
  });
};
export const useTopReviews = () => {
  return useQuery({
    queryKey: ['top-reviews'],
    queryFn: getTopReviewsRequest,
  });
};
