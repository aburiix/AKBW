'use client';

import {
  useCreateReview,
  useProductReviews,
  useUpdateReview,
} from '@/features/reviews/lib/hooks';
import DeleteConfirmModal from '@/widgets/delete-confirm/ui';
import { useDeleteReviewMutation } from '../lib/hooks';
import React, { useState } from 'react';
import { toast } from '@/shared/ui/toast';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/shared/lib/utils';
import { Loader2, Star } from 'lucide-react';
import { useUserStore } from '@/shared/store/user.store';
import { Button } from '@/shared/ui/button';
import ReviewCard from './ReviewCard';

type ReviewViewProps = {
  activeTab: string;
  productId: string;
};

export default function ReviewView({ activeTab, productId }: ReviewViewProps) {
  const [openDeleteReview, setOpenDeleteReview] = useState<boolean>(false);
  const [reviewId, setReviewId] = React.useState<number | null>(null);
  const [reviewText, setReviewText] = useState<string>('');
  const [userRating, setUserRating] = useState<number>(0);
  const [editingReviewId] = useState<number | null>(null);

  const { token } = useUserStore();

  const { data: reviewsData, isLoading: reviewsLoading } = useProductReviews(
    parseInt(productId),
  );
  const deleteReviewMutation = useDeleteReviewMutation();
  const updateReviewMutation = useUpdateReview(editingReviewId!);
  const createReviewMutation = useCreateReview();

  const queryClient = useQueryClient();

  const t = useTranslations('ProductPage');

  const handleDeleteReview = async (id: number) => {
    try {
      await deleteReviewMutation.mutateAsync(id);
      toast.success(t('review_deleted_success'));
      queryClient.invalidateQueries({
        queryKey: ['reviews'],
      });
      setOpenDeleteReview(false);
    } catch (_e) {
      toast.error(t('error_deleting_review'));
    }
  };

  const handleSubmitReview = async () => {
    if (!userRating || !reviewText.trim()) {
      toast.error(t('review_fields_required'));
      return;
    }

    try {
      if (editingReviewId) {
        await updateReviewMutation.mutateAsync({
          rating: userRating,
          comment: reviewText,
          product_id: parseInt(productId),
        });
      } else {
        await createReviewMutation.mutateAsync({
          rating: userRating,
          comment: reviewText,
          product_id: parseInt(productId),
        });
      }

      setUserRating(0);
      setReviewText('');
      toast.success(t('review_success'));
    } catch (_e) {
      toast.error(t('error_submitting_review'));
    }
  };

  return (
    <>
      {activeTab === 'reviews' && (
        <div className="max-w-4xl mx-auto space-y-4 mt-5 px-6">
          <DeleteConfirmModal
            isOpen={openDeleteReview}
            onClose={() => setOpenDeleteReview(false)}
            onConfirm={() => handleDeleteReview(reviewId!)}
            title={t('rating.deleteConfirmTitle')}
            description={t('rating.deleteConfirmDesc')}
          />

          {token && (
            <div className="mb-10 p-8 border border-gray-100 rounded-[32px] bg-[var(--color-akbw-filter-bg)]/40 shadow-sm">
              <h3 className="text-xl font-bold mb-6">
                {t('rating.leaveReview')}
              </h3>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-3">
                  {t('rating.giveRating')}
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setUserRating(star)}
                      className="hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        size={28}
                        className={cn(
                          'transition-colors',
                          star <= userRating
                            ? 'text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-400',
                        )}
                        fill={star <= userRating ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <textarea
                  placeholder={t('rating.reviewPlaceholder')}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full p-4 pr-24 border border-gray-200 rounded-[20px] resize-none focus:outline-none focus:border-black bg-white transition-all min-h-[100px] text-sm"
                  maxLength={500}
                />

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">
                    {reviewText.length}/500
                  </span>

                  <Button
                    onClick={handleSubmitReview}
                    disabled={createReviewMutation.isPending}
                    className="rounded-full px-8 py-2 h-auto flex items-center justify-center bg-black hover:bg-black/90 font-semibold text-sm cursor-pointer"
                  >
                    {createReviewMutation.isPending ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      'Joylash'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{t('rating.reviews')}</h2>
              <span className="text-gray-400 font-normal">
                ({reviewsData?.meta.total || 0})
              </span>
            </div>
          </div>

          {reviewsLoading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">{t('rating.loadingReviews')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviewsData?.data.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  setOpenDeleteReview={setOpenDeleteReview}
                  setReviewId={setReviewId}
                />
              ))}
            </div>
          )}

          {!reviewsLoading &&
            (!reviewsData?.data || reviewsData.data.length === 0) && (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Star size={32} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {t('rating.noReviews.title')}
                </h3>
                <p className="text-gray-500">{t('rating.noReviews.desc')}</p>
              </div>
            )}

          {!reviewsLoading &&
            reviewsData &&
            reviewsData.data.length > 0 &&
            reviewsData.meta.totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <Button
                  variant="outline"
                  className="rounded-full px-10 py-6 font-bold border-gray-200 hover:bg-black hover:text-white transition-all cursor-pointer"
                >
                  {t('rating.loadMore')}
                </Button>
              </div>
            )}
        </div>
      )}
    </>
  );
}
