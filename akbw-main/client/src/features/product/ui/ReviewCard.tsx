'use client';

import { IReview } from '@/shared/config/api/review/review.model';
import { cn } from '@/shared/lib/utils';
import { EllipsisVertical, Star } from 'lucide-react';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { useTranslations } from 'next-intl';
import { LazyLoadImage } from 'react-lazy-load-image-component';

interface ReviewCardProps {
  review: IReview;
  setOpenDeleteReview: (value: boolean) => void;
  setReviewId: (value: number) => void;
}

function ReviewCard({
  review,
  setOpenDeleteReview,
  setReviewId,
}: ReviewCardProps) {
  const t = useTranslations('ProductPage');
  return (
    <div key={review.id} className="p-6 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold shrink-0">
          {review.user.profile_picture?.length > 0 ? (
            <div className="w-full h-full rounded-full overflow-hidden relative">
              <LazyLoadImage
                src={review.user.profile_picture}
                alt={review.user.name}
                className="object-cover"
              />
            </div>
          ) : (
            review.user.name.charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-bold text-base">
              {review.user.name} {review.user.lastName}
            </h4>
            <span className="text-gray-400 text-sm">
              • {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={14}
                className={cn(
                  s <= review.rating ? 'text-yellow-400' : 'text-gray-200',
                )}
                fill={s <= review.rating ? 'currentColor' : 'none'}
              />
            ))}
          </div>

          <p className="text-gray-700 leading-relaxed text-sm">
            {review.comment}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <EllipsisVertical
              size={18}
              className="text-gray-400 cursor-pointer"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="outline-none border-none p-2">
            <DropdownMenuLabel
              onClick={() => {
                setOpenDeleteReview(true);
                setReviewId(review.id);
              }}
              className="cursor-pointer px-4 py-2 hover:bg-gray-100 rounded-md"
            >
              {t('rating.deleteConfirmTitle')}
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default React.memo(ReviewCard);
