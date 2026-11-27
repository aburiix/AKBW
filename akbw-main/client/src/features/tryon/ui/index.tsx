'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  Camera,
  Check,
  Download,
  ImageUp,
  RefreshCw,
  Send,
  ShoppingBag,
  Sparkles,
  Timer,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import { useUserStore } from '@/shared/store/user.store';
import { useCartStore } from '@/shared/store/cart.store';
import { cn } from '@/shared/lib/utils';
import { toast } from '@/shared/ui/toast';
import {
  getProductByIdRequest,
  getProductsRequest,
} from '@/shared/config/api/product/product.request';
import type { IProduct } from '@/shared/config/api/product/product.model';
import {
  createTryOnRequest,
  deleteTryOnRequest,
  getMyTryOnsRequest,
  type ITryOnItem,
} from '@/shared/config/api/tryon/tryon.request';

const Login = dynamic(() => import('@/widgets/login'), { ssr: false });
const Register = dynamic(() => import('@/widgets/register'), { ssr: false });

type View = 'empty' | 'cam' | 'review' | 'gen' | 'res';
type Result = {
  before: string;
  after: string;
  product?: IProduct;
  id?: string;
};

/** Suratni 1536px gacha kichraytirib JPEG qiladi (tez yuklanadi, AI uchun yetarli) */
async function toJpeg(
  src: Blob | HTMLCanvasElement,
  max = 1536,
): Promise<Blob> {
  let w: number,
    h: number,
    draw: (c: CanvasRenderingContext2D, w: number, h: number) => void;
  if (src instanceof HTMLCanvasElement) {
    w = src.width;
    h = src.height;
    draw = (c, cw, ch) => c.drawImage(src, 0, 0, cw, ch);
  } else {
    const bmp = await createImageBitmap(src);
    w = bmp.width;
    h = bmp.height;
    draw = (c, cw, ch) => c.drawImage(bmp, 0, 0, cw, ch);
  }
  const k = Math.min(1, max / Math.max(w, h));
  const c = document.createElement('canvas');
  c.width = Math.round(w * k);
  c.height = Math.round(h * k);
  draw(c.getContext('2d')!, c.width, c.height);
  return new Promise((r, j) =>
    c.toBlob((b) => (b ? r(b) : j(new Error('jpeg'))), 'image/jpeg', 0.9),
  );
}

export default function TryOn() {
  const t = useTranslations('TryOn');
  const token = useUserStore((s) => s.token);
  const addItem = useCartStore((s) => s.addItem);
  const qc = useQueryClient();
  const params = useSearchParams();
  const initialId = Number(params.get('product')) || null;

  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<View>('empty');
  const [productId, setProductId] = useState<number | null>(initialId);
  const [shot, setShot] = useState<{ url: string; blob: Blob } | null>(null);
  const [agree, setAgree] = useState(false);
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [count, setCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [split, setSplit] = useState(50);
  const [flash, setFlash] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(
    () => () => streamRef.current?.getTracks().forEach((tr) => tr.stop()),
    [],
  );

  const authed = mounted && !!token;

  const { data: me } = useQuery({
    queryKey: ['tryon-me'],
    queryFn: getMyTryOnsRequest,
    enabled: authed,
  });
  const { data: list } = useQuery({
    queryKey: ['tryon-products'],
    queryFn: () => getProductsRequest({ limit: 12 }),
  });
  const { data: initial } = useQuery({
    queryKey: ['product', initialId],
    queryFn: () => getProductByIdRequest(initialId!),
    enabled: !!initialId,
  });

  const products: IProduct[] = [
    ...(initial ? [initial] : []),
    ...(list?.data ?? []).filter((p) => p.id !== initial?.id),
  ].filter((p) => p.product_images?.length);
  const product = products.find((p) => p.id === productId);
  const left = me?.left ?? 0;
  const limit = me?.limit ?? 3;
  const step = view === 'gen' || view === 'res' ? 3 : productId ? 2 : 1;

  /* ---------- Kamera ---------- */
  const stopCam = () => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
  };
  const startCam = async (face = facing) => {
    try {
      stopCam();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: face,
          width: { ideal: 1440 },
          height: { ideal: 1920 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setView('cam');
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch (e) {
      toast.error(
        (e as Error)?.name === 'NotAllowedError'
          ? t('cam_denied')
          : t('cam_failed'),
      );
    }
  };
  const capture = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const x = c.getContext('2d')!;
    if (facing === 'user') {
      x.translate(c.width, 0);
      x.scale(-1, 1);
    }
    x.drawImage(v, 0, 0);
    setFlash(true);
    setTimeout(() => setFlash(false), 450);
    toJpeg(c).then((blob) => {
      setShot({ blob, url: URL.createObjectURL(blob) });
      stopCam();
      setView('review');
    });
  };
  const timer = () => {
    let n = 3;
    setCount(n);
    const iv = setInterval(() => {
      n -= 1;
      if (n === 0) {
        clearInterval(iv);
        setCount(0);
        capture();
      } else setCount(n);
    }, 1000);
  };
  const onFile = async (f?: File) => {
    if (!f) return;
    try {
      const blob = await toJpeg(f);
      setShot({ blob, url: URL.createObjectURL(blob) });
      setView('review');
    } catch {
      toast.error(t('bad_file'));
    }
  };

  /* ---------- AI ---------- */
  const run = async () => {
    if (!shot) return;
    if (!product) {
      toast.error(t('pick_first'));
      return;
    }
    if (!agree) {
      toast.error(t('consent_first'));
      return;
    }
    if (me && !me.enabled) {
      toast.error(t('err_disabled'));
      return;
    }
    if (left <= 0) {
      toast.error(t('err_limit'));
      return;
    }
    setView('gen');
    setProgress(4);
    const iv = setInterval(
      () => setProgress((p) => Math.min(92, p + (92 - p) * 0.08)),
      400,
    );
    try {
      const r = await createTryOnRequest(shot.blob, product.id);
      setProgress(100);
      setResult({ before: shot.url, after: r.resultUrl, product, id: r.id });
      setSplit(50);
      setView('res');
      qc.invalidateQueries({ queryKey: ['tryon-me'] });
    } catch (e) {
      const code = isAxiosError(e) ? e.response?.data?.code : undefined;
      const key =
        code === 'LIMIT'
          ? 'err_limit'
          : code === 'DISABLED'
            ? 'err_disabled'
            : code === 'BAD_IMAGE'
              ? 'err_bad_image'
              : code === 'TOO_BIG'
                ? 'err_too_big'
                : 'err_ai';
      toast.error(t(key));
      setView('review');
      qc.invalidateQueries({ queryKey: ['tryon-me'] });
    } finally {
      clearInterval(iv);
    }
  };

  const openHistory = (it: ITryOnItem) => {
    setResult({
      before: it.resultUrl,
      after: it.resultUrl,
      id: it.id,
      product: products.find((p) => p.id === it.productId),
    });
    setSplit(100);
    setView('res');
  };
  const remove = async (id?: string) => {
    if (!id) return;
    await deleteTryOnRequest(id).catch(() => {});
    qc.invalidateQueries({ queryKey: ['tryon-me'] });
    setResult(null);
    setView('empty');
    toast.success(t('deleted'));
  };
  const save = async () => {
    if (!result) return;
    try {
      const b = await (await fetch(result.after)).blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = 'akbw-try-on.jpg';
      a.click();
    } catch {
      window.open(result.after, '_blank');
    }
  };
  const share = async () => {
    if (!result) return;
    try {
      const b = await (await fetch(result.after)).blob();
      await navigator.share({
        files: [new File([b], 'akbw.jpg', { type: b.type })],
        title: 'AKBW',
      });
    } catch {
      save();
    }
  };
  const toCart = () => {
    const p = result?.product;
    if (!p) return;
    addItem(p, 1, p.sizes?.[0]?.name, p.colors?.[0]?.name);
    toast.success(t('added', { name: p.name }));
  };
  const reset = () => {
    setShot(null);
    setResult(null);
    setView('empty');
  };

  /* ---------- UI ---------- */
  const stepCls = (n: number) =>
    cn(
      'flex items-center gap-2.5 min-w-0 p-2.5 md:p-3 rounded-[14px] border transition-all',
      n === step
        ? 'border-line-2 bg-surface text-ivory'
        : 'border-line bg-surface text-ivory/40',
    );
  const dot = (n: number) =>
    cn(
      'grid place-items-center size-6 md:size-7 shrink-0 rounded-full border text-[12px] font-semibold',
      n === step
        ? 'bg-ivory text-night border-ivory'
        : n < step
          ? 'border-transparent bg-[#a9c49a]/20 text-[#a9c49a]'
          : 'border-line-2',
    );

  return (
    <div className="wrap pt-4 md:pt-6 pb-28 md:pb-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="lbl text-ivory/55">{t('kicker')}</span>
          <h1 className="serif text-[34px] md:text-[56px] leading-none text-ivory mt-2.5">
            {t('title')}
          </h1>
          <p className="text-ivory/60 max-w-[540px] mt-3 text-[14px] md:text-[15px]">
            {t('subtitle')}
          </p>
        </div>
        {authed && me && (
          <span className="lbl inline-flex items-center gap-2.5 h-[34px] px-3.5 rounded-full border border-line-2 text-ivory/60">
            {t('today')}{' '}
            <b className="text-ivory text-[13px] tracking-normal">{left}</b> /{' '}
            {limit}
            <span className="flex gap-1">
              {Array.from({ length: limit }).map((_, i) => (
                <i
                  key={i}
                  className={cn(
                    'size-[7px] rounded-full',
                    i < left ? 'bg-ivory' : 'bg-ivory/20',
                  )}
                />
              ))}
            </span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5 md:gap-2.5 mt-5">
        {[t('step1'), t('step2'), t('step3')].map((s, i) => (
          <div key={i} className={stepCls(i + 1)}>
            <b className={dot(i + 1)}>
              {i < step - 1 ? <Check size={13} /> : i + 1}
            </b>
            <span className="text-[11px] md:text-[13px] leading-tight">
              {s}
            </span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(330px,0.8fr)] gap-4 md:gap-5 mt-4 md:mt-5 items-start">
        {/* ---------- Sahna ---------- */}
        <section className="relative w-full aspect-[3/4] max-h-[74dvh] lg:max-h-[calc(100dvh-140px)] rounded-[20px] md:rounded-[24px] overflow-hidden border border-line bg-[radial-gradient(70%_60%_at_50%_30%,#3a2a1c,#15110d_70%)]">
          {!authed ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-7">
              <div className="grid place-items-center size-[84px] rounded-full border border-line-2 bg-ivory/[0.04]">
                <Sparkles size={32} strokeWidth={1.1} />
              </div>
              <h3 className="serif text-[26px] leading-tight text-ivory">
                {t('login_title')}
              </h3>
              <p className="text-ivory/60 max-w-[340px] text-[14px]">
                {t('login_text')}
              </p>
              {mounted && (
                <div className="flex flex-wrap justify-center gap-2.5">
                  <Login
                    trigger={
                      <button className="pill pill-ivory">{t('login')}</button>
                    }
                  />
                  <Register
                    trigger={
                      <button className="pill pill-ghost">
                        {t('register')}
                      </button>
                    }
                  />
                </div>
              )}
            </div>
          ) : view === 'empty' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-7">
              <div className="grid place-items-center size-[84px] rounded-full border border-line-2 bg-ivory/[0.04]">
                <Camera size={32} strokeWidth={1.1} />
              </div>
              <h3 className="serif text-[26px] leading-tight text-ivory">
                {t('empty_title')}
              </h3>
              <p className="text-ivory/60 max-w-[360px] text-[14px]">
                {t('empty_text')}
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                <button
                  className="pill pill-ivory cursor-pointer"
                  onClick={() => startCam()}
                >
                  <Video size={17} /> {t('camera')}
                </button>
                <button
                  className="pill pill-ghost cursor-pointer"
                  onClick={() => fileRef.current?.click()}
                >
                  <ImageUp size={17} /> {t('upload')}
                </button>
              </div>
            </div>
          ) : view === 'cam' ? (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className={cn(
                  'absolute inset-0 size-full object-cover',
                  facing === 'user' && '-scale-x-100',
                )}
              />
              <div className="absolute inset-[7%_18%_4%] border-[1.5px] border-dashed border-ivory/45 rounded-[46%_46%_18%_18%/22%_22%_10%_10%] pointer-events-none">
                <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 rounded-full bg-night/70 lbl !text-[10px] !tracking-[0.14em] text-ivory/60">
                  {t('frame_hint')}
                </span>
              </div>
              <div className="absolute inset-x-3.5 top-3.5 flex justify-between">
                <span className="glass lbl !text-[10.5px] inline-flex items-center gap-2 h-[34px] px-3.5 rounded-full">
                  <i className="size-[7px] rounded-full bg-[#e0896f] animate-pulse" />{' '}
                  {t('live')}
                </span>
                <button
                  className="glass lbl !text-[10.5px] h-[34px] px-3.5 rounded-full cursor-pointer"
                  onClick={() => {
                    stopCam();
                    setView('empty');
                  }}
                >
                  {t('close')} <X size={12} className="inline -mt-0.5" />
                </button>
              </div>
              {count > 0 && (
                <div className="absolute inset-0 grid place-items-center serif text-[120px] text-ivory [text-shadow:0_10px_40px_rgba(0,0,0,.5)] pointer-events-none">
                  {count}
                </div>
              )}
              <div className="glass absolute left-1/2 bottom-4 -translate-x-1/2 flex items-center gap-3.5 p-2 rounded-full">
                <button
                  aria-label={t('timer')}
                  className="grid place-items-center size-[46px] rounded-full hover:bg-white/10 cursor-pointer"
                  onClick={timer}
                >
                  <Timer size={20} strokeWidth={1.4} />
                </button>
                <button
                  aria-label={t('shoot')}
                  onClick={capture}
                  className="size-[68px] rounded-full bg-ivory shadow-[0_0_0_4px_rgba(239,232,219,.25)] active:scale-90 transition-transform cursor-pointer"
                />
                <button
                  aria-label={t('flip')}
                  className="grid place-items-center size-[46px] rounded-full hover:bg-white/10 cursor-pointer"
                  onClick={() => {
                    const f = facing === 'user' ? 'environment' : 'user';
                    setFacing(f);
                    startCam(f);
                  }}
                >
                  <RefreshCw size={20} strokeWidth={1.4} />
                </button>
              </div>
              <div
                className={cn(
                  'absolute inset-0 bg-white pointer-events-none transition-opacity duration-500',
                  flash ? 'opacity-80' : 'opacity-0',
                )}
              />
            </>
          ) : view === 'review' && shot ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shot.url}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
              <span className="glass lbl !text-[10.5px] absolute left-3.5 top-3.5 inline-flex items-center h-[34px] px-3.5 rounded-full">
                {t('your_photo')}
              </span>
              <div className="absolute inset-x-3.5 bottom-3.5 flex gap-2">
                <button
                  className="pill pill-ghost flex-1 !h-[46px] !px-3 bg-night/55 backdrop-blur-md cursor-pointer"
                  onClick={reset}
                >
                  {t('retake')}
                </button>
                <button
                  className="pill pill-ivory flex-1 !h-[46px] !px-3 cursor-pointer"
                  onClick={run}
                >
                  <Sparkles size={16} /> {t('run')}
                </button>
              </div>
            </>
          ) : view === 'gen' && shot ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shot.url}
                alt=""
                className="absolute inset-0 size-full object-cover blur-[2px] brightness-75"
              />
              <div className="tryon-scan absolute inset-x-0 h-[30%] bg-gradient-to-b from-transparent via-ivory/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-end gap-3.5 px-6 pb-9 text-center bg-gradient-to-b from-transparent via-transparent to-night/85">
                <span className="lbl text-ivory/60">{t('gen_eta')}</span>
                <h3 className="serif text-[26px] text-ivory">
                  {t('gen_title')}
                </h3>
                <div className="w-[min(320px,80%)] h-[3px] rounded bg-ivory/20 overflow-hidden">
                  <i
                    className="block h-full bg-ivory transition-[width] duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-ivory/60 text-[13px]">
                  {t(
                    progress < 30
                      ? 'gen_1'
                      : progress < 60
                        ? 'gen_2'
                        : progress < 85
                          ? 'gen_3'
                          : 'gen_4',
                  )}
                </span>
              </div>
            </>
          ) : view === 'res' && result ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.after}
                alt={t('after')}
                className="absolute inset-0 size-full object-cover"
              />
              {result.before !== result.after && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.before}
                    alt={t('before')}
                    className="absolute inset-0 size-full object-cover"
                    style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-0.5 -ml-px bg-ivory pointer-events-none"
                    style={{ left: `${split}%` }}
                  >
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center size-10 rounded-full bg-ivory text-night text-[15px] font-semibold">
                      ‹ ›
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={split}
                    onChange={(e) => setSplit(+e.target.value)}
                    aria-label={t('compare')}
                    className="absolute inset-0 size-full opacity-0 cursor-ew-resize"
                  />
                  <span className="absolute left-3.5 top-[60px] px-2.5 py-1 rounded-full bg-night/60 lbl !text-[9.5px] pointer-events-none">
                    {t('before')}
                  </span>
                  <span className="absolute right-3.5 top-[60px] px-2.5 py-1 rounded-full bg-night/60 lbl !text-[9.5px] pointer-events-none">
                    {t('after')}
                  </span>
                </>
              )}
              <div className="absolute inset-x-3.5 top-3.5 flex justify-between">
                <button
                  aria-label={t('delete')}
                  className="glass grid place-items-center size-[34px] rounded-full cursor-pointer"
                  onClick={() => remove(result.id)}
                >
                  <Trash2 size={14} />
                </button>
                <button
                  className="glass lbl !text-[10.5px] h-[34px] px-3.5 rounded-full cursor-pointer"
                  onClick={reset}
                >
                  {t('new_photo')}
                </button>
              </div>
              <div className="absolute inset-x-3.5 bottom-3.5 flex gap-2">
                <button
                  className="pill pill-ghost flex-1 !h-[46px] !px-3 bg-night/55 backdrop-blur-md cursor-pointer"
                  onClick={save}
                >
                  <Download size={16} /> {t('save')}
                </button>
                <button
                  className="pill pill-ghost flex-1 !h-[46px] !px-3 bg-night/55 backdrop-blur-md cursor-pointer"
                  onClick={share}
                >
                  <Send size={16} /> {t('share')}
                </button>
                {result.product && (
                  <button
                    className="pill pill-ivory flex-1 !h-[46px] !px-3 cursor-pointer"
                    onClick={toCart}
                  >
                    <ShoppingBag size={16} /> {t('to_cart')}
                  </button>
                )}
              </div>
            </>
          ) : null}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => {
              onFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </section>

        {/* ---------- Panel ---------- */}
        <aside className="flex flex-col gap-3.5 min-w-0">
          <div className="rounded-[18px] border border-line bg-surface p-[18px] min-w-0">
            <h4 className="lbl text-ivory/55 mb-3.5 flex justify-between">
              <span>1 · {t('pick')}</span>
              <span>{products.length}</span>
            </h4>
            {products.length === 0 ? (
              <p className="text-ivory/50 text-[13px]">{t('no_products')}</p>
            ) : (
              <div className="flex lg:grid lg:grid-cols-2 gap-2.5 overflow-x-auto snap-x -mx-[18px] px-[18px] lg:mx-0 lg:px-0 pb-1">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProductId(p.id)}
                    className={cn(
                      'relative shrink-0 basis-[42%] sm:basis-[28%] lg:basis-auto snap-start rounded-[14px] overflow-hidden bg-surface-2 border text-left transition-all cursor-pointer',
                      p.id === productId
                        ? 'border-ivory ring-1 ring-ivory'
                        : 'border-line hover:border-line-2',
                    )}
                  >
                    <div className="aspect-[4/5] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.product_images[0]}
                        alt={p.name}
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="px-2.5 pt-2 pb-2.5 text-[13px] leading-tight">
                      <b className="block font-medium text-ivory truncate">
                        {p.name}
                      </b>
                      <span className="text-ivory/40 text-[12.5px]">
                        {p.price.toLocaleString()} söm
                      </span>
                    </div>
                    {p.id === productId && (
                      <span className="absolute top-2 right-2 grid place-items-center size-[26px] rounded-full bg-ivory text-night">
                        <Check size={14} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[18px] border border-line bg-surface p-[18px]">
            <h4 className="lbl text-ivory/55 mb-3">{t('tips_title')}</h4>
            {[t('tip1'), t('tip2'), t('tip3')].map((s) => (
              <div
                key={s}
                className="flex gap-2.5 text-[13px] text-ivory/60 mt-2 first:mt-0"
              >
                <Check size={16} className="text-[#a9c49a] shrink-0 mt-0.5" />{' '}
                {s}
              </div>
            ))}
          </div>

          <label className="rounded-[18px] border border-line bg-surface p-[18px] flex gap-3 items-start text-[13px] text-ivory/60 cursor-pointer">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 size-5 shrink-0 accent-[#efe8db] cursor-pointer"
            />
            <span>{t('consent')}</span>
          </label>

          {authed && !!me?.items?.length && (
            <div className="rounded-[18px] border border-line bg-surface p-[18px]">
              <h4 className="lbl text-ivory/55 mb-3.5 flex justify-between gap-2">
                <span>{t('history')}</span>
                <span>{t('history_private')}</span>
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {me.items.slice(0, 8).map((it) => (
                  <button
                    key={it.id}
                    onClick={() => openHistory(it)}
                    className="aspect-[3/4] rounded-[10px] overflow-hidden bg-surface-2 border border-line cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.resultUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
