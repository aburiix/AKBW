'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/shared/config/i18n/navigation';
import { IProduct } from '@/shared/config/api/product/product.model';
import { Heart } from 'lucide-react';
import { useState } from 'react';

interface AnimatedProductCardProps {
  product: IProduct;
  index?: number;
}

export function AnimatedProductCard({
  product,
  index = 0,
}: AnimatedProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Calculate original price if there's a discount
  const originalPrice =
    product.discount > 0
      ? Math.round(product.price / (1 - product.discount / 100))
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <Link href={`/product/${product.id}`}>
        <motion.div
          className="group relative cursor-pointer"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#D6D3CC]/30">
            {/* Main Image */}
            <motion.div
              className="absolute inset-0"
              animate={{
                scale: isHovered ? 1.08 : 1,
              }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Image
                src={product.product_images?.[0] || '/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Overlay on hover */}
            <motion.div
              className="absolute inset-0 bg-black/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {product.discount > 0 && (
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-akbw-olive text-white text-xs font-medium px-3 py-1.5 rounded-full"
                >
                  -{product.discount}%
                </motion.span>
              )}
            </div>

            {/* Heart Button */}
            <motion.button
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1 : 0.8,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                setIsLiked(!isLiked);
              }}
              transition={{ duration: 0.2 }}
            >
              <Heart
                size={18}
                className={isLiked ? 'fill-red-500 text-red-500' : 'text-black'}
              />
            </motion.button>

            {/* Quick View Button */}
            <motion.div
              className="absolute bottom-4 left-4 right-4 z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                y: isHovered ? 0 : 20,
              }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <motion.button
                className="w-full py-3 bg-white/90 backdrop-blur-sm text-black text-sm font-medium rounded-full hover:bg-white transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Quick View
              </motion.button>
            </motion.div>
          </div>

          {/* Product Info */}
          <div className="mt-4 space-y-2">
            <motion.p
              className="text-xs text-gray-500 uppercase tracking-wider"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {product.categories?.[0]?.name}
            </motion.p>

            <motion.h3 className="text-base font-medium text-black group-hover:text-akbw-olive transition-colors duration-300">
              {product.name}
            </motion.h3>

            <div className="flex items-center gap-3">
              <motion.span
                className="text-lg font-semibold"
                animate={{
                  color: isHovered ? '#6B6E5F' : '#000000',
                }}
                transition={{ duration: 0.3 }}
              >
                {product.price?.toLocaleString('uz-UZ')} UZS
              </motion.span>
              {originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {originalPrice.toLocaleString('uz-UZ')} UZS
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
