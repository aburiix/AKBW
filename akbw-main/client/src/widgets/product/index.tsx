'use client';

import React from 'react';
import { IProduct } from '@/shared/config/api/product/product.model';
import { useWishlistStore } from '@/shared/store/wishlist.store';
import { Star, Heart } from 'lucide-react';
import { toast } from '@/shared/ui/toast';
import { cn } from '@/shared/lib/utils';
import { useUserStore } from '@/shared/store/user.store';
import { useCoordinatedModal } from '@/shared/hooks/use-coordinated-modal';
import { Link } from '@/shared/config/i18n/navigation';
import Image from 'next/image';

interface ProductProps {
  product?: IProduct;
}

export default React.memo(function Product({ product }: ProductProps) {
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const token = useUserStore((s) => s.token);
  const { openModal } = useCoordinatedModal('login-modal');

  if (!product) {
    return null;
  }

  const firstImage = product.product_images?.[0] || '/assets/product.png';
  const isFavorite = isInWishlist(product.id);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) {
      openModal();
      return;
    }
    toggleWishlist(product);
    if (!isFavorite) {
      toast.success(`${product.name} sevimlilarga qo'shildi`);
    } else {
      toast.info(`${product.name} sevimlilardan olib tashlandi`);
    }
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="cursor-pointer flex flex-col gap-3 group relative"
    >
      <div className="relative w-full aspect-[3/4] rounded-[28px] overflow-hidden bg-[#D6D3CC]/30 border border-black/10 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-black/10 group-hover:-translate-y-2">
        <Image
          src={firstImage}
          alt={product.name || 'product image'}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        <button
          onClick={handleToggleWishlist}
          className={cn(
            'absolute top-4 cursor-pointer right-4 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 z-10 shadow-sm',
            isFavorite
              ? 'bg-red-50 text-red-500 scale-110'
              : 'bg-white/80 text-gray-400 hover:text-red-500 hover:scale-110',
          )}
        >
          <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="px-1">
        <h1 className="text-lg font-semibold line-clamp-1 group-hover:text-black transition-colors">
          {product.name}
        </h1>

        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((_, index) => (
              <Star
                key={index}
                className={cn(
                  'text-sm transition-colors',
                  index < (product.rating || 0)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-yellow-300',
                )}
                size={14}
              />
            ))}
          </div>
          {product.rating > 0 ? (
            <p className="text-sm text-gray-400">({product.rating}/5)</p>
          ) : (
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-300">
              Baholanmagan
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold">
              {product.price.toLocaleString()} so&apos;m
            </span>
            {product.discount > 0 && (
              <span className="text-sm text-gray-400 line-through">
                {(
                  product.price *
                  (1 + product.discount / 100)
                ).toLocaleString()}{' '}
                so&apos;m
              </span>
            )}
          </div>
          {product.discount > 0 && (
            <span className="bg-red-50 text-red-500 px-2.5 py-1 rounded-lg text-xs font-black">
              -{product.discount}%
            </span>
          )}
        </div>
      </div>
    </Link>
  );
});
