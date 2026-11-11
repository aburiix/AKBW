'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useRouter } from '@/shared/config/i18n/navigation';

export interface RingItem {
  id: number | string;
  image: string;
  label: string;
  href: string;
}

/**
 * 3D halqa karusel: o'zi sekin aylanadi, sichqoncha/barmoq bilan suriladi,
 * bosilganda (surilmagan bo'lsa) tegishli sahifaga o'tadi.
 */
export default function RingCarousel({ items }: { items: RingItem[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const wrap = wrapRef.current;
    const ring = ringRef.current;
    if (!wrap || !ring || items.length === 0) return;

    // Kam element bo'lsa halqa bo'sh ko'rinmasligi uchun kamida 6 ta joy
    const cards = Array.from(ring.children) as HTMLElement[];
    const n = cards.length;
    const step = 360 / n;
    let radius = 0;

    const layout = () => {
      const w = ring.offsetWidth;
      radius = Math.round(w / 2 / Math.tan(Math.PI / n)) + 40;
      cards.forEach((el, i) => {
        el.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`;
      });
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(ring);

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const idle = reduce ? 0 : 0.12;
    let rot = 0;
    let vel = idle;
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let raf = 0;
    let visible = true;

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(wrap);

    const tick = () => {
      if (visible) {
        if (!dragging) {
          vel += (idle - vel) * 0.02;
          rot += vel;
        }
        ring.style.transform = `translateZ(-${radius}px) rotateX(-6deg) rotateY(${rot}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const down = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      wrap.setPointerCapture(e.pointerId);
      wrap.style.cursor = 'grabbing';
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      rot += dx * 0.25;
      vel = dx * 0.25;
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      wrap.style.cursor = '';
      // Surilmagan bo'lsa — bosilgan kartaga o'tish
      if (moved < 6) {
        const el = document
          .elementsFromPoint(e.clientX, e.clientY)
          .find((x) => (x as HTMLElement).dataset?.href) as
          | HTMLElement
          | undefined;
        if (el?.dataset.href) router.push(el.dataset.href);
      }
    };
    wrap.addEventListener('pointerdown', down);
    wrap.addEventListener('pointermove', move);
    wrap.addEventListener('pointerup', up);
    wrap.addEventListener('pointercancel', up);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener('pointerdown', down);
      wrap.removeEventListener('pointermove', move);
      wrap.removeEventListener('pointerup', up);
      wrap.removeEventListener('pointercancel', up);
    };
  }, [items, router]);

  if (items.length === 0) return null;

  // Halqa to'liq ko'rinishi uchun elementlar kamida 6 taga to'ldiriladi
  const slots: RingItem[] = [];
  while (slots.length < Math.max(6, items.length)) {
    slots.push(items[slots.length % items.length]);
  }

  return (
    <div
      ref={wrapRef}
      className="relative h-[clamp(400px,48vw,580px)] grid place-items-center cursor-grab select-none touch-pan-y [perspective:1600px] overflow-hidden"
    >
      <div
        ref={ringRef}
        className="relative w-[clamp(180px,21vw,280px)] aspect-[3/4.2] [transform-style:preserve-3d]"
      >
        {slots.map((it, i) => (
          <div
            key={`${it.id}-${i}`}
            data-href={it.href}
            className="absolute inset-0 rounded-[24px] overflow-hidden border border-line-2 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] bg-surface-2"
          >
            <Image
              src={it.image}
              alt={it.label}
              fill
              draggable={false}
              sizes="(max-width: 768px) 50vw, 21vw"
              className="object-cover pointer-events-none"
            />
            <span
              data-href={it.href}
              className="glass !bg-night/40 absolute left-2.5 right-2.5 bottom-2.5 rounded-2xl py-3 text-center lbl text-ivory"
            >
              {it.label}
            </span>
          </div>
        ))}
      </div>
      <div className="absolute bottom-[4%] w-3/5 h-10 bg-[radial-gradient(ellipse,rgba(0,0,0,0.5),transparent_70%)] blur-md pointer-events-none" />
    </div>
  );
}
