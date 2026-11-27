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

const SIZES = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';

/** Mahsulot kartasi — v5 dizayn. Sevimlilar/login mantiqi o'zgarmagan. */
export default React.memo(function Product({ product }: ProductProps) {
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const token = useUserStore((s) => s.token);
  const { openModal } = useCoordinatedModal('login-modal');

  if (!product) {
    return null;
  }

  const firstImage = product.product_images?.[0] || '/assets/product.png';
  const secondImage = product.product_images?.[1];
  const isFavorite = isInWishlist(product.id);
  // Eski narx hisobi avvalgi kod bilan bir xil qoldirildi
  const oldPrice =
    product.discount > 0 ? product.price * (1 + product.discount / 100) : 0;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      openModal();
      return;
    }
    toggleWishlist(product);
    if (!isFavorite) {
      toast.success(`${product.name} sevimlilarga qöşildi`);
    } else {
      toast.info(`${product.name} sevimlilardan olib tashlandi`);
    }
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="group relative flex flex-col gap-2.5 cursor-pointer"
    >
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-surface-2">
        <Image
          src={firstImage}
          alt={product.name || 'product image'}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          sizes={SIZES}
        />
        {secondImage && (
          <Image
            src={secondImage}
            alt=""
            fill
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            sizes={SIZES}
          />
        )}

        {product.discount > 0 && (
          <span className="absolute z-10 left-2.5 top-2.5 h-6 px-2.5 rounded-full bg-sale text-night text-[11px] font-semibold leading-6">
            −{product.discount}%
          </span>
        )}

        <button
          onClick={handleToggleWishlist}
          aria-label="Sevimlilar"
          className={cn(
            'absolute z-10 top-2 right-2 size-9 rounded-full grid place-items-center backdrop-blur-md transition-colors duration-300',
            isFavorite
              ? 'bg-night/60 text-sale'
              : 'bg-night/45 text-ivory hover:text-sale',
          )}
        >
          <Heart
            size={17}
            strokeWidth={1.6}
            fill={isFavorite ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      <div className="flex flex-col gap-1 px-0.5">
        {product.categories?.[0]?.name && (
          <span className="lbl !text-[9.5px] text-ivory/40">
            {product.categories[0].name}
          </span>
        )}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 md:gap-3">
          <h3 className="text-sm text-ivory line-clamp-1">{product.name}</h3>
          <div
            className={cn(
              'text-[15px] font-semibold whitespace-nowrap md:text-right',
              product.discount > 0 && 'text-sale',
            )}
          >
            {product.price.toLocaleString()} söm
            {oldPrice > 0 && (
              <s className="block text-xs font-normal text-ivory/40">
                {oldPrice.toLocaleString()} söm
              </s>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-ivory/60">
          <Star size={13} className="text-star fill-star" />
          {product.rating > 0 ? (
            <span>{Number(product.rating).toFixed(1)}</span>
          ) : (
            <span className="lbl !text-[9.5px] text-ivory/40">
              Baholanmagan
            </span>
          )}
        </div>
      </div>
    </Link>
  );
});
