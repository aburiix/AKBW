'use client';

import { ArrowLeft, ArrowRight, BadgeCheck, Star } from 'lucide-react';
import dynamic from 'next/dynamic';
import { IProduct } from '@/shared/config/api/product/product.model';
import { IStyle } from '@/shared/config/api/product/style.model';
import { Link } from '@/shared/config/i18n/navigation';
import { useEffect, useRef, useState } from 'react';
import Product from '../product';
import Image from 'next/image';
import {
  useRecommendedProducts,
  useStyles,
} from '@/features/products/lib/hooks';
import { useCategories } from '@/widgets/navbar/lib/hooks';
import { FadeUp, StaggerContainer, StaggerItem } from '@/shared/ui/animations';
import { useTopReviews } from '@/features/reviews/lib/hooks';
import { useUserStore } from '@/shared/store/user.store';
import { useTranslations } from 'next-intl';

const GlassLogo3D = dynamic(() => import('@/shared/ui/glass-logo-3d'), {
  ssr: false,
});
const Register = dynamic(() => import('@/widgets/register'), { ssr: false });
const Profile = dynamic(() => import('@/widgets/profile'), { ssr: false });
const RingCarousel = dynamic(() => import('@/shared/ui/ring-carousel'), {
  ssr: false,
});

const TILE_IMAGES = [
  '/assets/oversize.jpg',
  '/assets/sport-style.jpg',
  '/assets/minimalistik.jpg',
  '/assets/oldmoney.jpg',
  '/assets/giamour.webp',
  '/assets/welcome.jpg',
];

function SectionHead({
  eyebrow,
  title,
  href,
  hrefLabel,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <FadeUp>
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          {eyebrow && (
            <span className="lbl text-ivory/50 block mb-2.5">{eyebrow}</span>
          )}
          <h2 className="serif text-[clamp(28px,3.2vw,44px)] leading-[1.05] text-ivory">
            {title}
          </h2>
        </div>
        {href && (
          <Link
            href={href}
            className="pill pill-ghost pill-sm hidden md:inline-flex"
          >
            {hrefLabel}
          </Link>
        )}
      </div>
    </FadeUp>
  );
}

function ProductGrid({
  items,
  loading,
}: {
  items: IProduct[];
  loading: boolean;
}) {
  return (
    <StaggerContainer
      className="grid grid-cols-2 lg:grid-cols-4 gap-x-2.5 gap-y-6 md:gap-x-3.5 md:gap-y-7"
      staggerDelay={0.08}
    >
      {loading
        ? [1, 2, 3, 4].map((i) => (
            <StaggerItem key={i}>
              <div className="w-full aspect-[3/4] rounded-2xl bg-surface-2 animate-pulse" />
            </StaggerItem>
          ))
        : items.map((product) => (
            <StaggerItem key={product.id}>
              <Product product={product} />
            </StaggerItem>
          ))}
    </StaggerContainer>
  );
}

export default function Welcome() {
  const { data: topReviewsData, isLoading: isLoadingReviews } = useTopReviews();
  const { data: recommendedData, isLoading } = useRecommendedProducts();
  const { data: stylesData } = useStyles();
  const { data: categories } = useCategories();
  const token = useUserStore((s) => s.token);
  const [showAllMostSold, setShowAllMostSold] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllNewest, setShowAllNewest] = useState(false);

  const newest = recommendedData?.newest || [];
  const mostSold = recommendedData?.mostSold || [];
  const styles = stylesData?.data || [];
  const subCategories = (categories ?? [])
    .flatMap((c) => (c.children?.length ? c.children : c.parentId ? [] : [c]))
    .slice(0, 6);

  const displayNewest = showAllNewest ? newest : newest.slice(0, 8);
  const displayMostSold = showAllMostSold ? mostSold : mostSold.slice(0, 4);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const reviewRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (wrapperRef.current && reviewRef.current) {
      const amount = reviewRef.current.offsetWidth + 14;
      wrapperRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };

  // Sharhlar bo'limi avvalgidek: kamida 10 ta sharh bo'lsa ko'rsatiladi
  useEffect(() => {
    setShowAllReviews(!!topReviewsData && topReviewsData.data.length >= 10);
  }, [topReviewsData]);

  const t = useTranslations();

  return (
    <div className="wrap overflow-x-clip">
      {/* ---------- Banner (3D shisha logo) ---------- */}
      <section className="relative mt-4 md:mt-5 rounded-[28px] overflow-hidden border border-line grid lg:grid-cols-[1.1fr_1fr] min-h-[clamp(460px,64vh,680px)] bg-[radial-gradient(70%_70%_at_70%_30%,#6e4a2e,#24180f_60%,#120d09)]">
        <div className="relative z-10 order-2 lg:order-1 p-6 md:p-10 lg:p-14 flex flex-col justify-end gap-4 md:gap-5">
          <span className="lbl text-ivory/60">
            AKBW · {t('HomePage.newest')}
          </span>
          <h1 className="serif text-[clamp(34px,4.6vw,64px)] leading-none text-ivory">
            {t('HomePage.hero_title')}
          </h1>
          <p className="text-ivory/60 max-w-[460px] md:text-base">
            {t('HomePage.hero_subtitle')}
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/filters" className="pill pill-ivory">
              {t('HomePage.explore_product')} <ArrowRight size={16} />
            </Link>
            <Link href="/new" className="pill pill-ghost">
              {t('HomePage.newest')}
            </Link>
          </div>
        </div>
        <div className="relative order-1 lg:order-2 h-[340px] md:h-[420px] lg:h-auto">
          <GlassLogo3D className="absolute inset-0" />
          <Image
            src="/assets/welcome-right.png"
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="z-10 object-contain object-bottom pt-[6%] drop-shadow-[0_30px_40px_rgba(0,0,0,0.5)]"
          />
        </div>
      </section>

      {/* ---------- Kategoriyalar ---------- */}
      {subCategories.length > 0 && (
        <section className="pt-7">
          <div className="flex md:grid md:grid-cols-6 gap-2.5 overflow-x-auto no-scrollbar -mr-4 pr-4 md:mr-0 md:pr-0">
            {subCategories.map((c, i) => (
              <Link
                key={c.id}
                href={`/filters?category=${c.id}`}
                className="group relative shrink-0 w-[36%] md:w-auto aspect-[1/1.15] rounded-[18px] overflow-hidden bg-surface-2"
              >
                <Image
                  src={TILE_IMAGES[i % TILE_IMAGES.length]}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 36vw, 16vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-night/75" />
                <span className="absolute left-3 right-3 bottom-3 flex items-center justify-between lbl text-ivory">
                  {c.name}
                  <ArrowRight size={15} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Yangi qo'shilganlar ---------- */}
      <section className="pt-14 md:pt-24">
        <SectionHead
          eyebrow={t('NewArrivalsPage.latest_arrivals')}
          title={t('HomePage.newest')}
          href="/new"
          hrefLabel={t('Navbar.see_all')}
        />
        <ProductGrid items={displayNewest} loading={isLoading} />
        {!isLoading && newest.length > 8 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowAllNewest((v) => !v)}
              className="pill pill-ghost"
            >
              {showAllNewest
                ? t('HomePage.show_less')
                : t('HomePage.show_more')}
            </button>
          </div>
        )}
      </section>

      {/* ---------- AKBW Club banneri ---------- */}
      <FadeUp>
        <section className="mt-14 md:mt-24 grid md:grid-cols-2 rounded-[28px] overflow-hidden border border-line bg-surface">
          <div className="p-6 md:p-12 lg:p-14 flex flex-col justify-center gap-4 order-2 md:order-1">
            <span className="lbl text-ivory/50">AKBW Club</span>
            <h2 className="serif text-[clamp(28px,3.2vw,44px)] leading-[1.05]">
              {t('HomePage.akbw-title')}
            </h2>
            <p className="text-ivory/60">{t('HomePage.akbw-subtitle-1')}</p>
            <div className="flex flex-wrap gap-2">
              {[
                ['5%', t('Bonus.welcome_bonus')],
                ['10%', t('Bonus.referral_bonus')],
                ['5%', t('Bonus.referrer_bonus')],
              ].map(([v, l]) => (
                <span
                  key={l}
                  className="inline-flex items-center gap-2 h-[34px] px-3 rounded-full border border-line-2 text-[13px]"
                >
                  <b className="text-ok font-semibold">{v}</b> {l}
                </span>
              ))}
            </div>
            <div>
              {token ? (
                <Profile>
                  <button className="pill pill-ivory">
                    {t('Bonus.title')}
                  </button>
                </Profile>
              ) : (
                <Register
                  trigger={
                    <button className="pill pill-ivory">
                      {t('HomePage.login_register_btn')}
                    </button>
                  }
                />
              )}
            </div>
          </div>
          <div className="relative min-h-[240px] md:min-h-[380px] order-1 md:order-2">
            <Image
              src="/assets/akbw-about.jpg"
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </section>
      </FadeUp>

      {/* ---------- Eng ko'p sotilayotganlar ---------- */}
      <section className="pt-14 md:pt-24">
        <SectionHead
          eyebrow={t('BestSellersPage.based_on_sales')}
          title={t('HomePage.most-sold')}
          href="/best"
          hrefLabel={t('Navbar.see_all')}
        />
        <ProductGrid items={displayMostSold} loading={isLoading} />
        {!isLoading && mostSold.length > 4 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowAllMostSold((v) => !v)}
              className="pill pill-ghost"
            >
              {showAllMostSold
                ? t('HomePage.show_less')
                : t('HomePage.show_more')}
            </button>
          </div>
        )}
      </section>

      {/* ---------- Fasllar (admin paneldagi uslublar) ---------- */}
      <section className="pt-14 md:pt-24">
        <SectionHead
          eyebrow={t('HomePage.styles')}
          title={t('HomePage.seasons')}
        />
        {styles.length > 0 ? (
          <>
            <RingCarousel
              items={styles.map((style: IStyle) => ({
                id: style.id,
                image: style.image,
                label: style.category?.name ?? '',
                href: `/filters?category_id=${style.categoryId}`,
              }))}
            />
            <p className="lbl text-ivory/40 text-center -mt-2">
              ← sudrang · bosib oching →
            </p>
          </>
        ) : (
          !isLoading && (
            <p className="py-16 text-center text-ivory/40">
              {t('HomePage.no_seasons')}
            </p>
          )
        )}
      </section>

      {/* ---------- Sharhlar ---------- */}
      {showAllReviews && (
        <section className="pt-14 md:pt-24">
          <div className="flex items-end justify-between gap-4 mb-6">
            <FadeUp>
              <span className="lbl text-ivory/50 block mb-2.5">
                {t('HomePage.favorite_customers')}
              </span>
              <h2 className="serif text-[clamp(28px,3.2vw,44px)] leading-[1.05]">
                {t('HomePage.happy_customers_title')}
              </h2>
            </FadeUp>
            <div className="hidden md:flex gap-2">
              {(['left', 'right'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => handleScroll(d)}
                  aria-label={d}
                  className="size-11 rounded-full border border-line-2 grid place-items-center hover:bg-white/[0.06]"
                >
                  {d === 'left' ? (
                    <ArrowLeft size={18} />
                  ) : (
                    <ArrowRight size={18} />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div
            ref={wrapperRef}
            className="flex gap-3.5 overflow-x-auto no-scrollbar snap-x snap-mandatory"
          >
            {topReviewsData?.data?.map((review: any, index: number) => (
              <div
                ref={reviewRef}
                key={index}
                className="snap-start shrink-0 w-[86%] md:w-[calc((100%-28px)/3)] min-h-[220px] p-6 rounded-[18px] bg-surface border border-line flex flex-col justify-between gap-4"
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className={
                        i < review.rating
                          ? 'text-star fill-star'
                          : 'text-ivory/20'
                      }
                    />
                  ))}
                </div>
                <p className="serif text-[19px] leading-[1.35] line-clamp-4">
                  “{review.comment}”
                </p>
                <div className="flex items-center gap-2.5 text-[13px] text-ivory/60">
                  <span className="size-[34px] rounded-full bg-surface-3 grid place-items-center text-ivory">
                    {(review.user?.name || 'A')[0]}
                  </span>
                  {review.user?.name || t('HomePage.anonymous_user')}
                  <BadgeCheck size={16} className="text-ok" />
                </div>
              </div>
            ))}
            {!topReviewsData?.data?.length && !isLoadingReviews && (
              <p className="w-full py-10 text-center text-ivory/40">
                {t('HomePage.not_enough_reviews')}
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
