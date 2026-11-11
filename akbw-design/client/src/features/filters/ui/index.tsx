'use client';

import { colorToCss } from '@/shared/lib/colorToCss';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/shared/ui/input';
import React, { useEffect, useMemo } from 'react';

import { useColors, useSizes, useProducts } from '../lib/hooks';
import { useCategories } from '@/widgets/navbar/lib/hooks';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import Product from '@/widgets/product';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/sheet';
import {
  IProductFilters,
  IProduct,
  IColor,
} from '@/shared/config/api/product/product.model';
import { Category } from '@/features/product/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { useTranslations } from 'next-intl';
import { toast } from '@/shared/ui/toast';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function FilterPage() {
  const searchParams = useSearchParams();
  const categoryParam =
    searchParams.get('category') || searchParams.get('category_id');
  const searchParam = searchParams.get('q');
  const [isAll, setIsAll] = React.useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = React.useState<
    string | null | number
  >(categoryParam);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else if (searchParam) {
      setSelectedCategory(null);
    }
  }, [categoryParam, searchParam]);

  const [minPrice, setMinPrice] = React.useState<number>(0);
  const [maxPrice, setMaxPrice] = React.useState<number>(150000);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const debouncedMinPrice = useDebounce(minPrice, 500);
  const debouncedMaxPrice = useDebounce(maxPrice, 500);
  const [selectedColor, setSelectedColor] = React.useState<number | null>(null);
  const [openPagination, _setOpenPagination] = React.useState<boolean>(false);
  const [selectedSizes, setSelectedSizes] = React.useState<number[]>([]);

  const [sortBy, setSortBy] = React.useState<string>('createdAt');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  const { data: categories, error: categoriesError } = useCategories();
  const { data: colors } = useColors();
  const { data: sizes } = useSizes();

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useProducts({
    category_id: categoryParam || undefined,
    q: searchParam || undefined,
  });

  const t = useTranslations('FilterPage');

  const _appliedFilters = useMemo<IProductFilters>(
    () => ({
      category_id: selectedCategory ? selectedCategory.toString() : undefined,
      color_id: selectedColor ? selectedColor.toString() : undefined,
      size_id: selectedSizes.length > 0 ? selectedSizes.join(',') : undefined,
      min_price: debouncedMinPrice,
      max_price: debouncedMaxPrice,
      page: currentPage,
      sortBy,
      sortOrder,
    }),
    [
      selectedCategory,
      selectedColor,
      selectedSizes,
      debouncedMinPrice,
      debouncedMaxPrice,
      currentPage,
      sortBy,
      sortOrder,
    ],
  );

  useEffect(() => {
    if (categoriesError) {
      toast.error(t('categories_error'));
    }
  }, [categoriesError, t]);

  useEffect(() => {
    if (productsError) {
      toast.error(t('products_error'));
    }
  }, [productsError, t]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    selectedColor,
    selectedSizes,
    debouncedMinPrice,
    debouncedMaxPrice,
  ]);

  const toggleSize = (size: number) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  const parents: any[] = (categories ?? []).filter((c: any) => !c.parentId);
  const activeParent = parents.find(
    (p: any) =>
      Number(selectedCategory) === p.id ||
      p.children?.some((ch: any) => Number(selectedCategory) === ch.id),
  );
  const title = searchParam
    ? t('searchResult', { query: searchParam })
    : categories?.find((item: Category) => item.id === Number(selectedCategory))
        ?.name || t('allProducts');
  const activeCount =
    (selectedColor ? 1 : 0) +
    selectedSizes.length +
    (minPrice > 0 || maxPrice !== 150000 ? 1 : 0);
  const sortLabel =
    sortBy === 'price'
      ? sortOrder === 'asc'
        ? t('sortCheapest')
        : t('sortMostExpensive')
      : t('sortNewest');

  const chip = (active: boolean) =>
    cn(
      'shrink-0 h-10 px-4 rounded-full border lbl !tracking-[0.14em] transition-all cursor-pointer whitespace-nowrap',
      active
        ? 'bg-ivory text-night border-ivory'
        : 'border-line-2 text-ivory/70 hover:text-ivory hover:bg-ivory/[0.06]',
    );

  // Filtr paneli: kompyuterda yon panel, telefonda pastdan chiqadigan oyna
  const panel = (
    <div className="flex flex-col">
      <section className="pb-7">
        <h3 className="lbl text-ivory/45 mb-4">{t('filters')}</h3>
        <div id="categories" className="space-y-1">
          {parents.map((item: any, index: number) => {
            const isActive = Number(selectedCategory) === item.id;
            const hasActiveChild =
              item.children?.some(
                (child: any) => Number(selectedCategory) === child.id,
              ) || false;
            const isExpanded = isActive || hasActiveChild;
            if (!(isAll || index < 5 || isActive || hasActiveChild))
              return null;
            return (
              <div key={item.id ?? index}>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(isActive ? null : item.id)}
                  className={cn(
                    'w-full flex items-center justify-between h-11 px-4 rounded-2xl cursor-pointer transition-all text-left',
                    isActive
                      ? 'bg-ivory text-night'
                      : 'text-ivory/75 hover:bg-ivory/[0.06] hover:text-ivory',
                  )}
                >
                  <span className="text-[14px]">{item.name}</span>
                  {item.children?.length > 0 && (
                    <ChevronDown
                      size={16}
                      className={cn(
                        'transition-transform duration-300 opacity-60',
                        isExpanded && 'rotate-180',
                      )}
                    />
                  )}
                </button>
                {item.children?.length > 0 && isExpanded && (
                  <div className="ml-4 mt-1 mb-2 border-l border-line-2 pl-3 space-y-0.5">
                    {item.children.map((child: any, cIdx: number) => {
                      const isChildActive =
                        Number(selectedCategory) === child.id;
                      return (
                        <button
                          type="button"
                          key={child.id ?? cIdx}
                          onClick={() =>
                            setSelectedCategory(isChildActive ? null : child.id)
                          }
                          className={cn(
                            'w-full text-left h-9 px-3 rounded-xl text-[13px] transition-colors cursor-pointer',
                            isChildActive
                              ? 'bg-ivory/[0.12] text-ivory'
                              : 'text-ivory/55 hover:text-ivory hover:bg-ivory/[0.05]',
                          )}
                        >
                          {child.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {parents.length > 5 && (
            <button
              type="button"
              onClick={() => setIsAll(!isAll)}
              className="mt-2 w-full h-10 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-line-2 text-ivory/50 hover:text-ivory hover:bg-ivory/[0.04] transition-colors cursor-pointer"
            >
              {isAll ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            </button>
          )}
        </div>
      </section>

      <section className="py-7 border-t border-line">
        <h3 className="lbl text-ivory/45 mb-4">{t('price')}</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] text-ivory/40">{t('min')}</span>
            <Input
              type="number"
              inputMode="numeric"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="h-11 tabular-nums"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] text-ivory/40">{t('max')}</span>
            <Input
              type="number"
              inputMode="numeric"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="h-11 tabular-nums"
            />
          </label>
        </div>
      </section>

      <section className="py-7 border-t border-line">
        <h3 className="lbl text-ivory/45 mb-4">{t('colors')}</h3>
        <div className="flex flex-wrap gap-2.5">
          {colors?.map((color: IColor, i: number) => {
            const on = selectedColor === color.id;
            return (
              <button
                type="button"
                key={color.id ?? i}
                title={color.name}
                aria-label={color.name}
                onClick={() => setSelectedColor(on ? null : color.id)}
                className={cn(
                  'size-10 rounded-full grid place-items-center cursor-pointer transition-all ring-offset-[3px] ring-offset-surface',
                  on ? 'ring-2 ring-ivory' : 'hover:ring-1 hover:ring-ivory/40',
                )}
              >
                <span
                  style={{ backgroundColor: colorToCss(color.name) }}
                  className="size-8 rounded-full border border-line-2 grid place-items-center"
                >
                  {on && (
                    <Check
                      size={14}
                      className="text-ivory mix-blend-difference"
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="pt-7 border-t border-line">
        <h3 className="lbl text-ivory/45 mb-4">{t('sizes')}</h3>
        <div className="flex flex-wrap gap-2">
          {sizes?.map((size) => (
            <button
              type="button"
              key={size.id}
              onClick={() => toggleSize(size.id)}
              className={cn(
                'min-w-12 h-10 px-3.5 rounded-xl border text-[13px] transition-all cursor-pointer',
                selectedSizes.includes(size.id)
                  ? 'bg-ivory text-night border-ivory'
                  : 'border-line-2 text-ivory/70 hover:border-ivory/50 hover:text-ivory',
              )}
            >
              {size.name}
            </button>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <div className="wrap min-h-screen pt-6 md:pt-10 pb-16">
      {/* Sarlavha */}
      <div className="flex flex-col gap-3">
        <p className="lbl text-ivory/40">{t('breadcrumbs')}</p>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <h1 className="serif text-[36px] md:text-[56px] leading-[1] text-ivory">
            {title}
          </h1>
          {!productsLoading && productsData?.data && (
            <span className="lbl text-ivory/45 pb-2">
              {productsData.data.length} ·{' '}
              {t('allProducts').split(' ').slice(-1)[0]}
            </span>
          )}
        </div>
      </div>

      {/* Kategoriya chiplari */}
      {parents.length > 0 && !searchParam && (
        <div className="mt-6 -mx-4 px-4 md:mx-0 md:px-0 flex gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            className={chip(!selectedCategory)}
            onClick={() => setSelectedCategory(null)}
          >
            {t('allProducts')}
          </button>
          {parents.map((p: any) => (
            <button
              type="button"
              key={p.id}
              className={chip(activeParent?.id === p.id)}
              onClick={() => setSelectedCategory(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
      {activeParent?.children?.length > 0 && (
        <div className="mt-2.5 -mx-4 px-4 md:mx-0 md:px-0 flex gap-2 overflow-x-auto no-scrollbar">
          {activeParent.children.map((ch: any) => (
            <button
              type="button"
              key={ch.id}
              onClick={() =>
                setSelectedCategory(
                  Number(selectedCategory) === ch.id ? activeParent.id : ch.id,
                )
              }
              className={cn(
                'shrink-0 h-8 px-3.5 rounded-full text-[12.5px] transition-colors cursor-pointer',
                Number(selectedCategory) === ch.id
                  ? 'bg-ivory/[0.14] text-ivory'
                  : 'text-ivory/50 hover:text-ivory',
              )}
            >
              {ch.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-start gap-8 xl:gap-12 mt-8">
        <aside
          id="sidebar"
          className="hidden lg:block w-[290px] shrink-0 sticky top-28 rounded-[26px] border border-line bg-surface p-6 max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar"
        >
          {panel}
        </aside>

        <main id="main-content" className="flex-1 w-full min-w-0">
          {/* Asboblar paneli: telefonda filtr tugmasi + saralash */}
          <div className="sticky top-[64px] md:top-[76px] z-20 -mx-4 px-4 py-3 mb-6 md:static md:m-0 md:p-0 md:mb-8 bg-night/80 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none flex items-center justify-between gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="lg:hidden pill pill-ghost pill-sm gap-2"
                >
                  <SlidersHorizontal size={15} />
                  {t('filters')}
                  {activeCount > 0 && (
                    <span className="grid place-items-center size-5 rounded-full bg-ivory text-night text-[10px] tracking-normal">
                      {activeCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="!bg-surface border-t border-line-2 rounded-t-[28px] max-h-[86dvh] p-0 flex flex-col text-ivory"
              >
                <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-ivory/20" />
                <SheetHeader className="px-6 pt-3 pb-2">
                  <SheetTitle className="serif text-[26px] text-ivory font-normal">
                    {t('filters')}
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-6 pb-4">{panel}</div>
                <div className="p-4 border-t border-line pb-[calc(16px+env(safe-area-inset-bottom))]">
                  <SheetClose asChild>
                    <Button className="w-full">{t('applyFilters')}</Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
            <span className="hidden lg:block lbl text-ivory/40">
              {t('filters')}
              {activeCount > 0 ? ` · ${activeCount}` : ''}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="pill pill-ghost pill-sm gap-2 !tracking-[0.14em]"
                >
                  <span className="text-ivory/50">{t('sort')}:</span>
                  {sortLabel}
                  <ChevronDown size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="glass !bg-surface-2/90 rounded-2xl border-line-2 p-1.5 min-w-[200px] text-ivory"
              >
                {(
                  [
                    ['createdAt', 'desc', t('sortNewest')],
                    ['price', 'asc', t('sortCheapest')],
                    ['price', 'desc', t('sortMostExpensive')],
                  ] as const
                ).map(([by, order, label]) => (
                  <DropdownMenuItem
                    key={label}
                    onClick={() => {
                      setSortBy(by);
                      setSortOrder(order);
                    }}
                    className={cn(
                      'cursor-pointer h-10 px-3 rounded-xl text-[13px] flex items-center justify-between focus:bg-ivory/[0.08] focus:text-ivory',
                      sortBy === by && sortOrder === order && 'text-ivory',
                    )}
                  >
                    {label}
                    {sortBy === by && sortOrder === order && (
                      <Check size={14} />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-2.5 gap-y-6 md:gap-x-3.5 md:gap-y-8">
            {productsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] rounded-[22px] bg-ivory/[0.05]" />
                  <div className="mt-3 h-3 w-2/3 rounded bg-ivory/[0.06]" />
                  <div className="mt-2 h-3 w-1/3 rounded bg-ivory/[0.06]" />
                </div>
              ))
            ) : productsData?.data.length === 0 ? (
              <div className="col-span-full py-24 flex flex-col items-center text-center gap-3 rounded-[26px] border border-dashed border-line-2">
                <span className="serif text-[28px] text-ivory">AKBW</span>
                <p className="text-ivory/50 text-sm max-w-[36ch]">
                  {t('noProducts')}
                </p>
              </div>
            ) : (
              productsData?.data.map((item: IProduct) => (
                <Product key={item.id} product={item} />
              ))
            )}
          </div>

          {openPagination && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-12 pt-10 border-t border-line gap-6">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                {t('previous')}
              </Button>
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
                {[1, 2, 3, '...', 8, 9, 10].map((page, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      typeof page === 'number' && setCurrentPage(page)
                    }
                    className={cn(
                      'min-w-11 h-11 rounded-full text-sm transition-all cursor-pointer',
                      currentPage === page
                        ? 'bg-ivory text-night'
                        : 'text-ivory/50 hover:text-ivory hover:bg-ivory/[0.06]',
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                disabled={currentPage === 10}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, 10))}
              >
                {t('next')}
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
