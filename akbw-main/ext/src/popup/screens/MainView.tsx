import { useEffect, useMemo, useRef, useState } from "react";
import type { ProductData, ProductField } from "@/types/product";
import type { CatalogIdField, CatalogKind } from "@/types/product";
import type { AppSettings } from "@/types/settings";
import {
  APP_NAME,
  FIELD_LABELS,
  MAX_HISTORY,
  MAX_IMAGE_CANDIDATES,
} from "@/constants";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { PanelCloseButton } from "@/components/PanelCloseButton";
import { CardBadge, SectionCard } from "@/components/SectionCard";
import { ProgressBar } from "@/components/ProgressBar";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CandidatePicker } from "@/components/CandidatePicker";
import { SelectableImageGrid } from "@/components/SelectableImageGrid";
import { CheckboxList } from "@/components/CheckboxList";
import { useToasts } from "@/hooks/useToasts";
import { useProductData } from "@/hooks/useProductData";
import { useImport, type ImportDraft } from "@/hooks/useImport";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useCandidates } from "@/hooks/useCandidates";
import { useCatalog } from "@/hooks/useCatalog";
import { storage } from "@/storage";
import { parsePrice } from "@/utils/text";
import {
  applyMarkup,
  convertToUzs,
  detectCurrency,
  formatSom,
} from "@/utils/currency";
import type { ActiveTabInfo } from "@/hooks/useActiveTab";

interface MainViewProps {
  tab: ActiveTabInfo;
  settings: AppSettings;
  loaded: boolean;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
}

const TEXT_FIELDS: Array<{
  field: "title" | "price" | "description";
  multiline?: boolean;
  mono?: boolean;
  unit?: string;
  description?: string;
  placeholder: string;
}> = [
  { field: "title", placeholder: "Masalan: Paxta futbolka" },
  {
    field: "price",
    mono: true,
    unit: "¥",
    description:
      "Avtomatik o'zbek so'miga o'tkazilib, narxga +20% ustama qo'shiladi",
    placeholder: "Masalan: 99",
  },
  {
    field: "description",
    multiline: true,
    placeholder: "Mahsulot tavsifi",
  },
];

export function MainView({
  tab,
  settings,
  loaded,
  onOpenSettings,
  onOpenHistory,
}: MainViewProps) {
  const { data, setField, clear } = useProductData(
    tab,
    settings.rememberSelections,
  );
  const { candidates, url: candidatesUrl, loading: candidatesLoading, refresh: refreshCandidates } =
    useCandidates(tab);
  const {
    catalog,
    loading: catalogLoading,
    error: catalogError,
    refresh: refreshCatalog,
  } = useCatalog(settings, loaded);
  const { state: importState, start: startImport } = useImport();
  const { notify } = useToasts();
  const [confirmClear, setConfirmClear] = useState(false);
  const [priceHint, setPriceHint] = useState<number | null>(null);

  const loading = candidatesLoading || catalogLoading;

  const autoFilledUrl = useRef<string>("");

  useEffect(() => {
    let alive = true;
    const parsed = parsePrice(data.price);
    if (parsed <= 0) {
      setPriceHint(null);
      return;
    }
    void convertToUzs(parsed, detectCurrency(data.price))
      .then((uzs) => {
        if (alive) setPriceHint(applyMarkup(uzs));
      })
      .catch(() => {
        if (alive) setPriceHint(null);
      });
    return () => {
      alive = false;
    };
  }, [data.price]);

  useEffect(() => {
    if (!loaded || candidatesLoading) return;
    if (candidatesUrl !== tab.url) return;
    if (autoFilledUrl.current === tab.url) return;
    autoFilledUrl.current = tab.url;
    const patch: Partial<ProductData> = {};
    if (!data.title.trim() && candidates.title[0]) {
      patch.title = candidates.title[0].value;
    }
    if (!data.price.trim() && candidates.price[0]) {
      patch.price = candidates.price[0].value;
    }
    if (!data.description.trim() && candidates.description[0]) {
      patch.description = candidates.description[0].value;
    }
    if (data.images.length === 0 && candidates.images[0]) {
      patch.images = [candidates.images[0]];
    }
    for (const [field, value] of Object.entries(patch)) {
      setField(field as ProductField, value as ProductData[ProductField]);
    }
  }, [
    candidates,
    loaded,
    candidatesLoading,
    candidatesUrl,
    tab.url,
    data.title,
    data.price,
    data.description,
    data.images.length,
    setField,
  ]);

  const discountRaw = data.discount.trim();
  const discountValue = discountRaw === "" ? NaN : Number(discountRaw);
  const discountInvalid =
    discountRaw !== "" &&
    (!Number.isFinite(discountValue) ||
      discountValue < 0 ||
      discountValue > 100);

  const missing = useMemo(() => {
    const list: string[] = [];
    if (!data.title.trim()) list.push(FIELD_LABELS.title.toLowerCase());
    if (!data.price.trim() || parsePrice(data.price) <= 0) {
      list.push(FIELD_LABELS.price.toLowerCase());
    }
    if (data.images.length === 0) list.push("kamida bitta rasm");
    if (data.categoryIds.length === 0) list.push("kamida bitta kategoriya");
    if (data.sizeIds.length === 0) list.push("kamida bitta o'lcham");
    if (data.colorIds.length === 0) list.push("kamida bitta rang");
    return list;
  }, [data]);

  const canImport =
    missing.length === 0 &&
    !discountInvalid &&
    Boolean(settings.backendUrl.trim()) &&
    importState.status !== "loading";

  const toggleImage = (url: string): void => {
    setField(
      "images",
      data.images.includes(url)
        ? data.images.filter((item) => item !== url)
        : [...data.images, url],
    );
  };

  const selectAllImages = (): void => {
    setField("images", candidates.images);
    notify("info", `${candidates.images.length} ta rasm tanlandi.`);
  };

  const toggleIds = (kind: CatalogKind, id: number): void => {
    const field: CatalogIdField =
      kind === "categories" ? "categoryIds" : kind === "sizes" ? "sizeIds" : "colorIds";
    const current = data[field];
    setField(
      field,
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const handleRefresh = (): void => {
    void refreshCandidates();
    void refreshCatalog();
    notify("info", "Sahifa va katalog qayta yuklandi.");
  };

  const runImport = async (): Promise<void> => {
    if (!canImport) return;
    const draft: ImportDraft = {
      title: data.title,
      price: data.price,
      description: data.description,
      images: data.images,
      categoryIds: data.categoryIds,
      sizeIds: data.sizeIds,
      colorIds: data.colorIds,
      url: data.url || tab.url,
      ...(discountRaw !== "" ? { discount: Math.round(discountValue) } : {}),
    };

    try {
      const result = await startImport(draft, settings);
      if (!result.ok) {
        notify("error", result.message || "Mahsulot qo'shish muvaffaqiyatsiz yakunlandi.");
        return;
      }

      const entry = {
        id: crypto.randomUUID(),
        title: data.title,
        price: data.price,
        url: data.url || tab.url,
        hostname: tab.hostname,
        image: draft.images[0] ?? "",
        importedAt: new Date().toISOString(),
      };
      const history = await storage.getHistory();
      await storage.setHistory([entry, ...history].slice(0, MAX_HISTORY));

      notify("success", result.message || "Mahsulot muvaffaqiyatli qo'shildi.");

      if (settings.clearAfterImport) {
        clear();
      }
    } catch (error) {
      if (error instanceof Error) {
        notify("error", error.message);
      }
    }
  };

  const handleClear = (): void => {
    clear();
    notify("info", "Tanlov tozalandi.");
  };

  const onImportShortcut = (): void => {
    if (missing.length > 0) {
      notify("error", `To'ldirilishi shart: ${missing.join(", ")}.`);
      return;
    }
    if (!settings.backendUrl.trim()) {
      notify("error", "API URL sozlanmagan. Sozlamalarni oching.");
      return;
    }
    void runImport();
  };

  const onClearShortcut = (): void => {
    setConfirmClear(true);
  };

  useKeyboardShortcuts({ onImport: onImportShortcut, onClear: onClearShortcut });

  return (
    <div className="relative flex h-full flex-col">
      <header className="flex items-center gap-2 border-b border-zinc-200 bg-white px-3.5 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
          <Icon name="import" size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[13px] font-semibold leading-tight">{APP_NAME}</h1>
          <p className="truncate text-[11px] leading-tight text-zinc-500 dark:text-zinc-400">
            {tab.hostname || "Mahsulot sahifasini oching"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          aria-label="Qayta yuklash"
          title="Qayta yuklash"
        >
          <Icon name="refresh" size={16} />
        </button>
        <button
          type="button"
          onClick={onOpenHistory}
          className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          aria-label="Import tarixi"
        >
          <Icon name="history" size={16} />
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          aria-label="Sozlamalar"
        >
          <Icon name="settings" size={16} />
        </button>
        <PanelCloseButton />
      </header>

      {!tab.isUsable ? (
        <div className="flex-1 overflow-y-auto">
          <EmptyState
            icon="alert"
            title="Mahsulot sahifasini oching"
            description="Kengaytma faqat haqiqiy e-commerce sahifalarida ishlaydi. Oddiy HTTP/HTTPS sahifasiga o'ting va qaytadan oching."
          />
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto px-3.5 py-3">
          {loading && (
            <div className="flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-500/30 dark:bg-blue-500/10">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600 dark:border-blue-500/30 dark:border-t-blue-400" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Ma'lumotlar yuklanmoqda…
              </p>
            </div>
          )}

          {catalogError && (
            <div className="flex items-center gap-2.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 dark:border-amber-500/40 dark:bg-amber-500/10">
              <Icon name="alert" size={15} className="shrink-0 text-amber-500" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                  Katalog yuklanmadi
                </p>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                  {catalogError}
                </p>
              </div>
            </div>
          )}

          {TEXT_FIELDS.map(({ field, multiline, mono, unit, description, placeholder }) => (
            <SectionCard
              key={field}
              title={FIELD_LABELS[field]}
              description={description ?? "Sahifadan avtomatik topilgan variantlardan birini tanlang yoki o'zingiz yozing"}
              badge={<CardBadge selected={Boolean(data[field].trim())} />}
            >
              <CandidatePicker
                candidates={candidates[field]}
                value={data[field]}
                onChange={(value) => setField(field, value)}
                multiline={multiline}
                mono={mono}
                unit={unit}
                placeholder={placeholder}
              />
              {field === "price" && priceHint !== null && (
                <p className="mt-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Yakuniy narx: ≈ {formatSom(priceHint)} so'm (kurs +20%)
                </p>
              )}
            </SectionCard>
          ))}

          <SectionCard
            title={FIELD_LABELS.discount}
            description="Ixtiyoriy — foizlarda, 0-100 oraliqda"
            badge={
              <Badge tone={data.discount.trim() ? "success" : "neutral"}>
                {data.discount.trim() || "Yo'q"}
              </Badge>
            }
          >
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                inputMode="numeric"
                value={data.discount}
                onChange={(event) => setField("discount", event.target.value)}
                placeholder="Masalan: 10"
                className={`w-full rounded-lg border bg-white px-2.5 py-2 pr-8 text-[13px] text-zinc-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${
                  discountInvalid
                    ? "border-red-400 dark:border-red-500"
                    : "border-zinc-200 dark:border-zinc-700"
                }`}
              />
              <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[13px] font-medium text-zinc-400 dark:text-zinc-500">
                %
              </span>
            </div>
            {discountInvalid && (
              <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                Chegirma 0-100 oralig'ida bo'lishi kerak.
              </p>
            )}
          </SectionCard>

          <SectionCard
            title={FIELD_LABELS.images}
            description={`Sahifadan ${candidates.images.length} ta rasm topildi`}
            badge={
              <Badge tone={data.images.length > 0 ? "success" : "neutral"}>
                {data.images.length} ta
              </Badge>
            }
            action={
              candidates.images.length > 0 ? (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Icon name="check" size={13} />}
                  onClick={selectAllImages}
                >
                  Barchasi
                </Button>
              ) : undefined
            }
          >
            <SelectableImageGrid
              images={candidates.images}
              selected={data.images}
              onToggle={toggleImage}
              maxVisible={MAX_IMAGE_CANDIDATES}
              empty={
                <div className="flex flex-col items-center gap-1 py-2 text-center">
                  <Icon name="image" size={18} className="text-zinc-300 dark:text-zinc-600" />
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    Sahifada mos rasm topilmadi
                  </p>
                </div>
              }
            />
          </SectionCard>

          <SectionCard
            title={FIELD_LABELS.categories}
            description="Backenddagi kategoriyalardan bir yoki bir nechtasini tanlang"
            badge={
              <Badge tone={data.categoryIds.length > 0 ? "success" : "neutral"}>
                {data.categoryIds.length} ta
              </Badge>
            }
          >
            <CheckboxList
              items={catalog.categories}
              selected={data.categoryIds}
              onToggle={(id) => toggleIds("categories", id)}
              placeholder="Kategoriyalar yuklanmadi"
            />
          </SectionCard>

          <SectionCard
            title={FIELD_LABELS.colors}
            description="Backenddagi ranglardan tanlang"
            badge={
              <Badge tone={data.colorIds.length > 0 ? "success" : "neutral"}>
                {data.colorIds.length} ta
              </Badge>
            }
          >
            <CheckboxList
              items={catalog.colors}
              selected={data.colorIds}
              onToggle={(id) => toggleIds("colors", id)}
              placeholder="Ranglar yuklanmadi"
              swatch
            />
          </SectionCard>

          <SectionCard
            title={FIELD_LABELS.sizes}
            description="Backenddagi o'lchamlardan tanlang"
            badge={
              <Badge tone={data.sizeIds.length > 0 ? "success" : "neutral"}>
                {data.sizeIds.length} ta
              </Badge>
            }
          >
            <CheckboxList
              items={catalog.sizes}
              selected={data.sizeIds}
              onToggle={(id) => toggleIds("sizes", id)}
              placeholder="O'lchamlar yuklanmadi"
            />
          </SectionCard>
        </div>
      )}

      <footer className="space-y-1.5 border-t border-zinc-200 bg-white px-3.5 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
        {missing.length > 0 && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400">
            To'ldirilishi shart: {missing.join(", ")}
          </p>
        )}
        {!settings.backendUrl.trim() && loaded && (
          <p className="text-[11px] text-red-600 dark:text-red-400">
            API URL sozlanmagan — sozlamalarni oching
          </p>
        )}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="md"
            icon={<Icon name="trash" size={14} />}
            onClick={() => setConfirmClear(true)}
          >
            Tozalash
          </Button>
          <Button
            fullWidth
            size="md"
            loading={importState.status === "loading"}
            icon={<Icon name="import" size={14} />}
            disabled={!canImport}
            onClick={() => void runImport()}
          >
            Mahsulotni qo'shish
          </Button>
        </div>
        {importState.status === "loading" && (
          <ProgressBar value={importState.progress} />
        )}
      </footer>

      {importState.status === "loading" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-zinc-50/80 backdrop-blur-sm animate-fade-in dark:bg-zinc-950/80">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-blue-600 dark:border-zinc-700 dark:border-t-blue-500" />
          <div className="w-56">
            <ProgressBar value={importState.progress} />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {importState.progress < 55
              ? "Tarjima va kurs yuklanmoqda…"
              : "Mahsulot qo'shilmoqda…"}
          </p>
        </div>
      )}

      <ConfirmDialog
        open={confirmClear}
        title="Tanlovni tozalash?"
        description="Barcha tanlangan maydonlar, rasmlar, kategoriya/rang/o'lchamlar o'chiriladi."
        confirmLabel="Tozalash"
        danger
        onConfirm={handleClear}
        onClose={() => setConfirmClear(false)}
      />
    </div>
  );
}
