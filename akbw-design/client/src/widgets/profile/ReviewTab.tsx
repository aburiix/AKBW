import { cn } from '@/shared/lib/utils';
import { ExternalLink, MessageSquare, Star } from 'lucide-react';
import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/shared/config/i18n/navigation';

interface Props {
  reviews: any[];
}

export default function ReviewTab({ reviews }: Props) {
  const t = useTranslations('Profile');

  return (
    <div className="space-y-3">
      {reviews.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <MessageSquare size={48} className="mx-auto mb-3 opacity-20" />
          <p>{t('reviews_empty')}</p>
        </div>
      ) : (
        reviews.map((review) => (
          <div
            key={review.id}
            className="p-4 bg-surface rounded-2xl border border-line"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-medium text-sm">
                {t('order_label')} #{review.id}
              </h4>
              <Link
                href={`/product/${review.product_id}`}
                className="text-gray-400 hover:text-black transition-colors cursor-pointer"
              >
                <ExternalLink size={16} />
              </Link>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={cn(
                    i < review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300',
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">{review.comment}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
