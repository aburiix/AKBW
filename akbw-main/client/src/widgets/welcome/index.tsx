'use client';

import { ArrowRight, BadgeCheck, Star } from 'lucide-react';
import dynamic from 'next/dynamic';
import { IProduct } from '@/shared/config/api/product/product.model';
import { IStyle } from '@/shared/config/api/product/style.model';
import { Link } from '@/shared/config/i18n/navigation';
import Product from '../product';
import Image from 'next/image';
import {
  useRecommendedProducts,
  useStyles,
} from '@/features/products/lib/hooks';
import { FadeUp } from '@/shared/ui/animations';
import { useTopReviews } from '@/features/reviews/lib/hooks';
import { useTranslations } from 'next-intl';

const GlassLogo3D = dynamic(() => import('@/shared/ui/glass-logo-3d'), {
  ssr: false,
});
const RingCarousel = dynamic(() => import('@/shared/ui/ring-carousel'), {
  ssr: false,
});

/** Ilovadagi 4 fasl — bir xil gradientlar */
const SEASONS = [
  {
    key: 'spring',
    icon: '✿',
    bg: 'radial-gradient(90% 80% at 70% 20%, #7C8466, #2A2C22 65%, #151610)',
  },
  {
    key: 'summer',
    icon: '☀',
    bg: 'radial-gradient(90% 80% at 70% 20%, #C9A46A, #4A3520 65%, #1A130C)',
  },
  {
    key: 'autumn',
    icon: '❦',
    bg: 'radial-gradient(90% 80% at 70% 20%, #8A6243, #3A2416 65%, #150E09)',
  },
  {
    key: 'winter',
    icon: '❄',
    bg: 'radial-gradient(90% 80% at 70% 20%, #8FA3B8, #2A3440 65%, #10141A)',
  },
] as const;

/** Brend uslub rasmlari — karusel to'liq bo'lishi uchun (ilovadagidek) */
const BRAND_STYLES = [
  { title: 'Old money', image: '/assets/oldmoney.jpg' },
  { title: 'Oversize', image: '/assets/oversize.jpg' },
  { title: 'Minimalistik', image: '/assets/minimalistik.jpg' },
  { title: 'Sport', image: '/assets/sport-style.jpg' },
  { title: 'Glamour', image: '/assets/giamour.webp' },
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
      <div className="flex items-end justify-between gap-4 mb-5 md:mb-6">
        <div>
          {eyebrow && (
            <span className="lbl text-ivory/50 block mb-2.5">{eyebrow}</span>
          )}
          <h2 className="serif text-[clamp(28px,3.2vw,44px)] leading-[1.05] text-ivory">
            {title}
          </h2>
        </div>
        {href && (
          <Link href={href} className="pill pill-ghost pill-sm">
            {hrefLabel}
          </Link>
        )}
      </div>
    </FadeUp>
  );
}

/** Telefonda — gorizontal qator (ilovadagidek), kompyuterda — 4 ustunli setka */
function ProductRow({
  items,
  loading,
}: {
  items: IProduct[];
  loading: boolean;
}) {
  const cell =
    'shrink-0 w-[44%] max-w-[190px] md:w-auto md:max-w-none snap-start';
  return (
    <div className="flex md:grid md:grid-cols-4 gap-2.5 md:gap-x-3.5 md:gap-y-7 overflow-x-auto md:overflow-visible no-scrollbar snap-x -mx-4 px-4 md:mx-0 md:px-0">
      {loading
        ? [1, 2, 3, 4].map((i) => (
            <div key={i} className={cell}>
              <div className="w-full aspect-[3/4] rounded-2xl bg-surface-2 animate-pulse" />
            </div>
          ))
        : items.map((product) => (
            <div key={product.id} className={cell}>
              <Product product={product} />
            </div>
          ))}
    </div>
  );
}

export default function Welcome() {
  const { data: topReviewsData } = useTopReviews();
  const { data: recommendedData, isLoading } = useRecommendedProducts();
  const { data: stylesData } = useStyles();
  const t = useTranslations();

  const newest = (recommendedData?.newest || []).slice(0, 8);
  const mostSold = (recommendedData?.mostSold || []).slice(0, 8);
  const styles: IStyle[] = stylesData?.data || [];
  const reviews = topReviewsData?.data ?? [];

  const ring = [
    ...styles.map((style) => ({
      id: `s${style.id}`,
      image: style.image,
      label: style.category?.name ?? '',
      href: `/filters?category_id=${style.categoryId}`,
    })),
    ...BRAND_STYLES.map((s) => ({
      id: s.title,
      image: s.image,
      label: s.title,
      href: '/filters',
    })),
  ];

  return (
    <div className="wrap overflow-x-clip">
      {/* ---------- Banner (rasm ustida — doim tungi ranglar) ---------- */}
      <section
        data-theme="dark"
        className="relative mt-4 md:mt-5 rounded-[28px] overflow-hidden border border-line grid lg:grid-cols-[1.1fr_1fr] min-h-[clamp(460px,64vh,680px)] bg-[radial-gradient(70%_70%_at_70%_30%,#6e4a2e,#24180f_60%,#120d09)] text-ivory"
      >
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
          <div className="flex gap-2.5">
            <Link
              href="/filters"
              className="pill pill-ivory max-md:!h-[46px] max-md:!px-5"
            >
              {t('HomePage.products_btn')} <ArrowRight size={16} />
            </Link>
            <Link
              href="/new"
              className="pill pill-ghost max-md:!h-[46px] max-md:!px-5"
            >
              {t('HomePage.newest_btn')}
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

      {/* ---------- Fasllar — banner ostida bir qatorda ---------- */}
      <section
        data-theme="dark"
        className="pt-3 md:pt-4 grid grid-cols-4 gap-2 md:gap-3.5"
      >
        {SEASONS.map((f) => (
          <Link
            key={f.key}
            href="/filters"
            style={{ backgroundImage: f.bg }}
            className="relative aspect-[1/1.25] md:aspect-[16/10] rounded-[16px] md:rounded-[22px] overflow-hidden border border-line p-2.5 md:p-5 flex flex-col justify-between transition-transform hover:-translate-y-0.5"
          >
            <span className="text-ivory/80 text-lg md:text-3xl leading-none">
              {f.icon}
            </span>
            <span className="flex flex-col gap-1">
              <span className="lbl !text-[8.5px] md:!text-[11px] text-ivory/60">
                {t('HomePage.season')}
              </span>
              <span className="serif text-[17px] md:text-[30px] leading-none text-ivory">
                {t(`HomePage.season_${f.key}`)}
              </span>
            </span>
          </Link>
        ))}
      </section>

      {/* ---------- Yangi qo'shilganlar ---------- */}
      <section className="pt-11 md:pt-24">
        <SectionHead
          eyebrow={t('HomePage.kicker_new')}
          title={t('HomePage.newest')}
          href="/new"
          hrefLabel={t('HomePage.all_btn')}
        />
        <ProductRow items={newest} loading={isLoading} />
      </section>

      {/* ---------- Ko'p sotilganlar ---------- */}
      {(isLoading || mostSold.length > 0) && (
        <section className="pt-11 md:pt-24">
          <SectionHead
            eyebrow={t('HomePage.kicker_top')}
            title={t('HomePage.top_sold')}
            href="/best"
            hrefLabel={t('HomePage.all_btn')}
          />
          <ProductRow items={mostSold} loading={isLoading} />
        </section>
      )}

      {/* ---------- Uslublar — 3D aylanma karusel ---------- */}
      <section className="pt-12 md:pt-24">
        <SectionHead
          eyebrow={t('HomePage.kicker_styles')}
          title={t('HomePage.styles_title')}
        />
        <RingCarousel items={ring} />
        <p className="lbl text-ivory/40 text-center -mt-2">
          {t('HomePage.ring_hint')}
        </p>
      </section>

      {/* ---------- Mamnun mijozlar ---------- */}
      {reviews.length > 0 && (
        <section className="pt-11 md:pt-24">
          <SectionHead
            eyebrow={t('HomePage.reviews_kicker')}
            title={t('HomePage.reviews_title')}
          />
          <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
            {reviews.map((review: any, index: number) => (
              <Link
                key={review.id ?? index}
                href={review.product_id ? `/product/${review.product_id}` : '/'}
                className="snap-start shrink-0 w-[82%] md:w-[calc((100%-24px)/3)] min-h-[200px] p-6 rounded-[18px] bg-surface border border-line flex flex-col justify-between gap-4"
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
                <p className="serif text-[19px] leading-[1.35] line-clamp-4 text-ivory">
                  “{review.comment}”
                </p>
                <div className="flex items-center gap-2 text-[13px] text-ivory/60">
                  {review.user?.name || t('HomePage.anonymous_user')}
                  <BadgeCheck size={16} className="text-ok" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Biz haqimizda kartasi ---------- */}
      <FadeUp>
        <section className="mt-12 md:mt-24 grid md:grid-cols-2 rounded-[24px] overflow-hidden border border-line bg-surface">
          <div className="relative h-[220px] md:h-auto md:min-h-[380px]">
            <Image
              src="/assets/welcome.jpg"
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="p-[22px] md:p-12 flex flex-col justify-center gap-3 md:gap-4">
            <span className="lbl text-ivory/50">
              {t('HomePage.brand_kicker')}
            </span>
            <h2 className="serif text-[26px] md:text-[clamp(28px,3vw,42px)] leading-[1.1] text-ivory">
              Aburiix Kraft Brand Wear
            </h2>
            <p className="text-ivory/60 text-sm md:text-base leading-relaxed">
              {t('HomePage.brand_text')}
            </p>
            <div className="flex flex-wrap gap-2.5 mt-1">
              <button
                onClick={() =>
                  window.dispatchEvent(new CustomEvent('akbw:assistant'))
                }
                className="pill pill-ivory"
              >
                {t('HomePage.ai_btn')}
              </button>
              <Link href="/about" className="pill pill-ghost">
                {t('HomePage.about_btn')}
              </Link>
            </div>
          </div>
        </section>
      </FadeUp>
    </div>
  );
}
