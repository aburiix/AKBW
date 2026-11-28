import { notifyError } from '@/shared/lib/notify-error';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createReviewRequest,
  getProductReviewsRequest,
  updateReviewRequest,
  getTopReviewsRequest,
} from '@/shared/config/api/review/review.request';
import { ICreateReviewRequest } from '@/shared/config/api/review/review.model';

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
    onError: (error: any) => notifyError(error, 'Şarh yaratişda xatolik yuz berdi'),
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
    onError: (error: any) => notifyError(error, 'Şarh yangilaşda xatolik yuz berdi'),
  });
};
export const useTopReviews = () => {
  return useQuery({
    queryKey: ['top-reviews'],
    queryFn: getTopReviewsRequest,
  });
};
