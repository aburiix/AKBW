'use client';

import { ArrowLeft, ArrowRight, MapPinCheckInside, Star } from 'lucide-react';
import { IProduct } from '@/shared/config/api/product/product.model';
import { IStyle } from '@/shared/config/api/product/style.model';
import { Link } from '@/shared/config/i18n/navigation';
import HeroBg from '../../../public/assets/herobg.jpg';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { monsterrat } from '@/shared/fonts';
import { cn } from '@/shared/lib/utils';
import { motion } from 'framer-motion';
import Product from '../product';
import Image from 'next/image';
import {
  useRecommendedProducts,
  useStyles,
} from '@/features/products/lib/hooks';
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
  AnimatedLine,
} from '@/shared/ui/animations';

import { useTopReviews } from '@/features/reviews/lib/hooks';
import { useTranslations } from 'next-intl';

export default function Welcome() {
  const { data: topReviewsData, isLoading: isLoadingReviews } = useTopReviews();
  const { data: recommendedData, isLoading } = useRecommendedProducts();
  const [showAllMostSold, setShowAllMostSold] = useState<boolean>(false);
  const [showAllReviews, setShowAllReviews] = useState<boolean>(false);
  const [showAllNewest, setShowAllNewest] = useState<boolean>(false);
  const { data: stylesData } = useStyles();

  const newest = recommendedData?.newest || [];
  const mostSold = recommendedData?.mostSold || [];
  const styles = stylesData?.data || [];

  const displayNewest = showAllNewest ? newest : newest.slice(0, 4);
  const displayMostSold = showAllMostSold ? mostSold : mostSold.slice(0, 4);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const reviewRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (wrapperRef.current && reviewRef.current) {
      const scrollAmount = reviewRef.current.offsetWidth + 20;
      const newScrollPosition =
        direction === 'left'
          ? wrapperRef.current.scrollLeft - scrollAmount
          : wrapperRef.current.scrollLeft + scrollAmount;
      wrapperRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (topReviewsData && topReviewsData?.data.length >= 10) {
      setShowAllReviews(true);
    } else {
      setShowAllReviews(false);
    }
  }, [topReviewsData?.data.length]);

  const t = useTranslations();
  return (
    <div className="overflow-hidden">
      <div
        className={cn(
          'flex',
          'lg:mt-10',
          'flex-col',
          'lg:flex-row',
          'items-center',
          'justify-between',
          'max-lg:justify-center',
          'max-lg:items-start',
        )}
      >
        <div
          className={cn(
            'container',
            'relative',
            'z-10',
            'py-20',
            'min-h-[700px]',
            'lg:py-40',
            'w-full',
          )}
        >
          <Image
            src={HeroBg.src}
            alt="Hero Background"
            fill
            className={cn(
              'w-full',
              'h-[60vh]',
              'object-cover',
              'rounded-[20px]',
              'max-md:rounded-none',
            )}
          />
          <div
            className={cn(
              'absolute',
              'bg-black/20',
              'text-white',
              'top-0',
              'left-0',
              'w-full',
              'h-full',
              'rounded-[20px]',
              'flex',
              'flex-col',
              'items-center',
              'justify-start',
              'pt-[120px]',
              'text-center',
              'px-5',
            )}
          >
            <h1 className={cn('text-5xl', 'max-w-[80%]', 'max-md:text-2xl')}>
              {t('HomePage.hero_title')}
            </h1>
            <p className={cn('max-md:text-sm', 'text-[20px]')}>
              {t('HomePage.hero_subtitle')}
            </p>
            <Link href="/filters">
              <button
                className={cn(
                  'flex',
                  'items-center',
                  'justify-center',
                  'px-2',
                  'py-1',
                  'bg-white/50',
                  'text-black',
                  'rounded-full',
                  'btn-hero-padding',
                  'hover:bg-white/80',
                  'border-1',
                  'border-black/20',
                  'shadow-xl',
                  'mt-5',
                  'transition-all',
                  'duration-300',
                  'cursor-pointer',
                )}
              >
                <p className={cn('max-md:text-[10px]', 'text-sm', 'font-bold')}>
                  {t('HomePage.explore_product')}
                </p>
                <div
                  className={cn(
                    'flex',
                    'items-center',
                    'justify-center',
                    'bg-[#000]',
                    'text-white',
                    'rounded-full',
                    'ml-3',
                    'w-9',
                    'h-9',
                    'max-md:w-5',
                    'max-md:h-5',
                  )}
                >
                  <ArrowRight size={20} className="text-white" />
                </div>
              </button>
            </Link>
          </div>
        </div>
      </div>
      <div className={cn('container', 'py-20')}>
        <div>
          <FadeUp>
            <h2
              className={cn(
                'text-4xl font-bold text-center uppercase my-10 max-sm:text-[20px]',
                monsterrat.className,
              )}
            >
              {t('HomePage.newest')}
            </h2>
          </FadeUp>

          <AnimatedLine
            className={cn('w-24', 'mx-auto', 'mb-10')}
            delay={0.3}
          />

          <StaggerContainer
            className={cn(
              'grid',
              'grid-cols-1',
              'sm:grid-cols-2',
              'lg:grid-cols-4',
              'gap-5',
              'mt-5',
            )}
            staggerDelay={0.1}
          >
            {isLoading
              ? [1, 2, 3, 4].map((_, index) => (
                  <StaggerItem key={index}>
                    <div
                      className={cn(
                        'w-full',
                        'aspect-[3/4]',
                        'rounded-2xl',
                        'bg-gray-200',
                        'animate-pulse',
                      )}
                    />
                  </StaggerItem>
                ))
              : displayNewest.map((product: IProduct) => (
                  <StaggerItem key={product.id}>
                    <Product product={product} />
                  </StaggerItem>
                ))}
          </StaggerContainer>

          {!isLoading && newest.length > 4 && (
            <FadeUp delay={0.4}>
              <div
                className={cn(
                  'flex',
                  'items-center',
                  'justify-center',
                  'mt-10',
                )}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={() => setShowAllNewest(!showAllNewest)}
                    className={cn(
                      'bg-[#fff]/50',
                      'text-[#000]',
                      'hover:border-[#000]/100',
                      'btn-register-padding',
                      'hover:bg-[#fff]/80',
                      'border-1',
                      'border-[#000]/20',
                      'shadow-xl',
                    )}
                  >
                    {showAllNewest
                      ? t('HomePage.show_less')
                      : t('HomePage.show_more')}
                  </Button>
                </motion.div>
              </div>
            </FadeUp>
          )}
        </div>
      </div>

      <AnimatedLine className="container" />

      <div className={cn('container', 'py-20')}>
        <div>
          <FadeUp>
            <h2
              className={cn(
                'text-4xl font-bold text-center uppercase my-10 max-sm:text-[20px]',
                monsterrat.className,
              )}
            >
              {t('HomePage.most-sold')}
            </h2>
          </FadeUp>

          <AnimatedLine
            className={cn('w-24', 'mx-auto', 'mb-10')}
            delay={0.3}
          />

          <StaggerContainer
            className={cn(
              'grid',
              'grid-cols-1',
              'sm:grid-cols-2',
              'lg:grid-cols-4',
              'gap-5',
              'mt-5',
            )}
            staggerDelay={0.1}
          >
            {isLoading
              ? [1, 2, 3, 4].map((_, index) => (
                  <StaggerItem key={index}>
                    <div
                      className={cn(
                        'w-full',
                        'aspect-[3/4]',
                        'rounded-2xl',
                        'bg-gray-200',
                        'animate-pulse',
                      )}
                    />
                  </StaggerItem>
                ))
              : displayMostSold.map((product: IProduct) => (
                  <StaggerItem key={product.id}>
                    <Product product={product} />
                  </StaggerItem>
                ))}
          </StaggerContainer>

          {!isLoading && mostSold.length > 4 && (
            <FadeUp delay={0.4}>
              <div
                className={cn(
                  'flex',
                  'items-center',
                  'justify-center',
                  'mt-10',
                )}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={() => setShowAllMostSold(!showAllMostSold)}
                    className={cn(
                      'bg-[#fff]/50',
                      'text-[#000]',
                      'hover:border-[#000]/100',
                      'btn-register-padding',
                      'hover:bg-[#fff]/80',
                      'border-1',
                      'border-[#000]/20',
                      'shadow-xl',
                    )}
                  >
                    {showAllMostSold
                      ? t('HomePage.show_less')
                      : t('HomePage.show_more')}
                  </Button>
                </motion.div>
              </div>
            </FadeUp>
          )}
        </div>
      </div>

      <FadeUp>
        <div
          className={cn(
            'container',
            'mt-[50px]',
            'bg-[#D6D3CC]/40',
            'p-6',
            'lg:p-20',
            'pt-20',
            'rounded-[20px]',
            'my-10',
          )}
        >
          <FadeUp>
            <h2
              className={cn(
                'text-3xl lg:text-4xl font-bold text-center uppercase mb-10',
                monsterrat.className,
              )}
            >
              {t('HomePage.seasons')}
            </h2>
          </FadeUp>

          <div className={cn('flex', 'flex-col', 'gap-5', 'w-full')}>
            {styles
              .reduce((acc: IStyle[][], style: IStyle, i: number) => {
                if (i % 2 === 0) acc.push([style]);
                else acc[acc.length - 1].push(style);
                return acc;
              }, [])
              .map((pair: IStyle[], rowIndex: number) => (
                <div
                  key={rowIndex}
                  className={cn(
                    'flex',
                    'flex-col',
                    'lg:flex-row',
                    'gap-5',
                    'w-full',
                  )}
                >
                  {pair.map((style: IStyle, colIndex: number) => {
                    const isFirst = colIndex === 0;
                    const isThree = rowIndex % 2 === 0 ? isFirst : !isFirst;

                    return (
                      <motion.div
                        key={style.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{
                          duration: 0.6,
                          delay: colIndex * 0.15,
                          ease: [0.25, 0.1, 0.25, 1],
                        }}
                        className={cn(
                          'w-full cursor-pointer',
                          isThree ? 'lg:flex-[3]' : 'lg:flex-[7]',
                        )}
                      >
                        <Link href={`/filters?category_id=${style.categoryId}`}>
                          <div
                            className={cn(
                              'group relative w-full h-[190px] lg:h-[330px] rounded-[10px] overflow-hidden',
                              'transition-transform duration-500 ease-out will-change-transform',
                              'group-hover:scale-[1.02]',
                            )}
                          >
                            <motion.div
                              className={cn(
                                'text-sm',
                                'font-bold',
                                'z-10',
                                'absolute',
                                'top-5',
                                'left-5',
                                'text-white',
                                'bg-[#000]/30',
                                'px-3',
                                'py-1',
                                'rounded-lg',
                              )}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.3 }}
                            >
                              <h3>{style.category.name}</h3>
                            </motion.div>
                            <Image
                              src={style.image}
                              alt={style.category.name}
                              fill
                              sizes="(max-width: 1024px) 100vw, 50vw"
                              loading="lazy"
                              className={cn(
                                'object-cover',
                                'transition-transform duration-700 ease-out will-change-transform',
                                'group-hover:scale-110',
                              )}
                            />
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              ))}

            {styles.length === 0 && !isLoading && (
              <div className={cn('py-20', 'text-center', 'text-gray-400')}>
                <p>{t('HomePage.no_seasons')}</p>
              </div>
            )}
          </div>
        </div>
      </FadeUp>

      {showAllReviews && (
        <div className="py-20">
          <div
            className={cn(
              'container',
              'mb-10',
              'flex',
              'items-end',
              'justify-between',
            )}
          >
            <FadeUp>
              <h2
                className={cn(
                  'text-4xl font-bold uppercase',
                  monsterrat.className,
                )}
              >
                {t('HomePage.happy_customers_title')}
              </h2>
            </FadeUp>
            <FadeUp delay={0.2}>
              <div className={cn('flex', 'gap-4')}>
                <motion.button
                  onClick={() => handleScroll('left')}
                  className={cn(
                    'p-2',
                    'border',
                    'border-black/10',
                    'rounded-full',
                    'hover:bg-black',
                    'hover:text-white',
                    'transition-all',
                    'cursor-pointer',
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ArrowLeft size={20} />
                </motion.button>
                <motion.button
                  onClick={() => handleScroll('right')}
                  className={cn(
                    'p-2',
                    'border',
                    'border-black/10',
                    'rounded-full',
                    'hover:bg-black',
                    'hover:text-white',
                    'transition-all',
                    'cursor-pointer',
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ArrowRight size={20} />
                </motion.button>
              </div>
            </FadeUp>
          </div>

          <div
            className={cn(
              'flex',
              'gap-5',
              'overflow-x-scroll',
              'px-5',
              'no-scrollbar',
            )}
            ref={wrapperRef}
          >
            {topReviewsData?.data && topReviewsData.data.length >= 10
              ? topReviewsData.data.map((review: any, index: number) => (
                  <motion.div
                    ref={reviewRef}
                    key={index}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-20px' }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    whileHover={{
                      y: -8,
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    }}
                    className={cn(
                      'flex',
                      'flex-col',
                      'gap-3',
                      'border-1',
                      'border-black/10',
                      'p-5',
                      'rounded-[20px]',
                      'bg-[#D6D3CC]/20',
                      'w-[300px]',
                      'shrink-0',
                      'transition-shadow',
                    )}
                  >
                    <div className={cn('flex', 'items-center', 'gap-2')}>
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                        >
                          <Star
                            size={20}
                            fill={i < review.rating ? 'yellow' : 'none'}
                            className={
                              i < review.rating
                                ? 'text-yellow-500'
                                : 'text-gray-300'
                            }
                          />
                        </motion.div>
                      ))}
                    </div>
                    <div className={cn('flex', 'items-center', 'gap-2')}>
                      <h1 className="font-bold">
                        {review.user?.name || t('HomePage.anonymous_user')}
                      </h1>
                      <MapPinCheckInside size={20} />
                    </div>
                    <p className={cn('text-sm', 'line-clamp-3')}>
                      {review.comment}
                    </p>
                  </motion.div>
                ))
              : !isLoadingReviews && (
                  <div
                    className={cn(
                      'w-full',
                      'py-10',
                      'text-center',
                      'text-gray-400',
                    )}
                  >
                    <p>{t('HomePage.not_enough_reviews')}</p>
                  </div>
                )}
          </div>
        </div>
      )}
    </div>
  );
}
