'use client';

import React, { useMemo, useState } from 'react';
import {
  Download,
  ShoppingBag,
  Headphones,
  Truck,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useDashboardData, useStatisticsData } from '../lib/hooks';
import { useOrders } from '../../orders/lib/hooks';
import { useGetAdminShipments } from '../../shipments/lib/hooks';
import { useAdminMe } from '@/widgets/header/lib/hooks';
import { useBadges } from '@/widgets/layout/model/use-badges';
import { Link } from '@/shared/config/i18n/navigation';
import OrderDetailModal from '../../orders/ui/order-detail-modal';
import { cn } from '@/shared/lib/utils';
import { Pill, stateOf } from '@/shared/ui/order-state';
import type { IOrder } from '@/shared/config/api/order/order.model';

/* ───────── yordamchilar ───────── */
const fmt = (n: number) => Math.round(n || 0).toLocaleString('ru-RU');
const money = (n: number) => {
  if (n >= 1e9) return { v: (n / 1e9).toFixed(1).replace('.', ','), u: "mlrd so'm" };
  if (n >= 1e6) return { v: (n / 1e6).toFixed(1).replace('.', ','), u: "mln so'm" };
  if (n >= 1e4) return { v: fmt(n / 1000), u: "ming so'm" };
  return { v: fmt(n), u: "so'm" };
};
const UZ_DAYS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];

const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn('bg-s1 border border-line rounded-[18px]', className)}>{children}</div>
);

function Spark({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const w = 88, h = 28, p = 3;
  const mx = Math.max(...data), mn = Math.min(...data);
  const pts = data.map((v, i) => [
    (i * w) / (data.length - 1),
    h - p - ((v - mn) / (mx - mn || 1)) * (h - p * 2),
  ]);
  const up = data[data.length - 1] >= data[0];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-[88px] h-7 hidden sm:block">
      <polyline
        points={pts.map((q) => q.join(',')).join(' ')}
        fill="none"
        stroke={up ? 'var(--ok)' : 'var(--sale)'}
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Delta({ value }: { value: number | null }) {
  if (value === null || !isFinite(value)) return <span className="text-xs text-mute2">—</span>;
  const up = value >= 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-[3px] rounded-full',
        up ? 'text-ok bg-green-50' : 'text-sale bg-red-50',
      )}
    >
      {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      {Math.abs(value).toFixed(1).replace('.', ',')}%
    </span>
  );
}

const pct = (cur: number, prev: number) => (prev > 0 ? ((cur - prev) / prev) * 100 : null);

/* ───────── sahifa ───────── */
export default function Dashboard() {
  const [dayRange, setDayRange] = useState<7 | 30>(7);
  const [openOrder, setOpenOrder] = useState<IOrder | null>(null);

  const { data: me } = useAdminMe();
  const { data: dashboardData, isLoading: l1 } = useDashboardData(dayRange);
  const { data: statsData, isLoading: l2 } = useStatisticsData(dayRange);
  const { data: ordersData, isLoading: l3 } = useOrders();
  const { data: customsData } = useGetAdminShipments('IN_CUSTOMS');
  const badges = useBadges();

  const orders: IOrder[] = useMemo(
    () =>
      [...((ordersData?.data || []) as IOrder[])].sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      ),
    [ordersData],
  );

  /* Savdo seriyasi (sana bo'yicha o'sish tartibida) */
  const series = useMemo(() => {
    const month = [...(statsData?.monthSales || [])].sort((a, b) => a.date.localeCompare(b.date));
    const week = [...(statsData?.weekSales || [])].sort((a, b) => a.date.localeCompare(b.date));
    const cur = dayRange === 7 ? (week.length ? week : month.slice(-7)) : month.slice(-30);
    const prevSrc = month.filter((m) => !cur.some((c) => c.date === m.date));
    const prev = dayRange === 7 ? prevSrc.slice(-7) : [];
    return cur.map((c, i) => {
      const d = new Date(c.date);
      return {
        name:
          dayRange === 7
            ? UZ_DAYS[d.getDay()].slice(0, 2)
            : `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`,
        date: c.date,
        sales: c.count,
        prev: prev.length === cur.length ? prev[i]?.count : undefined,
      };
    });
  }, [statsData, dayRange]);

  /* Holat bo'yicha taqsimot (tanlangan davr) */
  const since = Date.now() - dayRange * 864e5;
  const periodOrders = orders.filter((o) => +new Date(o.createdAt) >= since);
  const prevPeriodOrders = orders.filter(
    (o) => +new Date(o.createdAt) < since && +new Date(o.createdAt) >= since - dayRange * 864e5,
  );
  const byState = periodOrders.reduce<Record<string, number>>((acc, o) => {
    const k = o.state === 'CALCELLED' ? 'CANCELLED' : o.state;
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const cancelled = byState.CANCELLED || 0;

  if (l1 || l2 || l3) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="lbl animate-pulse">Yuklanmoqda…</div>
      </div>
    );
  }

  const totalSales = dashboardData?.overAllSales?._sum?.total_price || 0;
  const sumPrev = (arr: IOrder[]) =>
    arr.filter((o) => o.state === 'PAID').reduce((s, o) => s + (o.total_price || 0), 0);
  const avgCheck = statsData?.averageCheckPrice || 0;
  const sales = money(totalSales);
  const check = money(avgCheck);

  const kpis = [
    {
      title: 'Umumiy savdo',
      value: sales.v,
      unit: sales.u,
      delta: pct(sumPrev(periodOrders), sumPrev(prevPeriodOrders)),
      spark: series.map((s) => s.sales),
    },
    {
      title: 'Buyurtmalar',
      value: fmt(dashboardData?.ordersNumber || 0),
      delta: dashboardData?.grownPercentsAtOrders ?? pct(periodOrders.length, prevPeriodOrders.length),
      spark: series.map((s) => s.sales),
    },
    {
      title: 'Yangi mijozlar',
      value: fmt(statsData?.newUserCount ?? dashboardData?.usersNumber ?? 0),
      unit: dayRange === 7 ? '7 kunda' : '30 kunda',
      delta: null,
      spark: [],
    },
    {
      title: "O'rtacha chek",
      value: check.v,
      unit: check.u,
      delta: null,
      spark: [],
    },
  ];

  const now = new Date();
  const name = me?.admin?.name?.split(' ')[0] || '';
  const h = now.getHours();
  const greet = h < 5 ? 'Xayrli tun' : h < 12 ? 'Xayrli tong' : h < 18 ? 'Xayrli kun' : 'Xayrli kech';
  const todayCount = orders.filter((o) => new Date(o.createdAt).toDateString() === now.toDateString()).length;

  const customs = Array.isArray(customsData) ? customsData : customsData?.data || [];

  const exportCsv = () => {
    const rows = [
      ['AKBW admin hisobot', `${dayRange} kun`, now.toLocaleString('ru-RU')],
      [],
      ["Ko'rsatkich", 'Qiymat'],
      ['Umumiy savdo (so\'m)', totalSales],
      ['Buyurtmalar', dashboardData?.ordersNumber || 0],
      ['Yangi mijozlar', statsData?.newUserCount ?? ''],
      ["O'rtacha chek (so'm)", avgCheck],
      [],
      ['Sana', 'Savdo'],
      ...series.map((s) => [s.date, s.sales]),
      [],
      ['Holat', 'Soni'],
      ...Object.entries(byState).map(([k, v]) => [stateOf(k).label, v]),
    ];
    const csv = '﻿' + rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `akbw-hisobot-${now.toISOString().slice(0, 10)}-${dayRange}kun.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  /* donut */
  const donutParts = ['PAID', 'SENT', 'REVIEW', 'PENDING', 'CANCELLED']
    .map((k) => ({ k, v: byState[k] || 0 }))
    .filter((p) => p.v > 0);
  const donutTotal = donutParts.reduce((s, p) => s + p.v, 0);
  const R = 78, C = 2 * Math.PI * R;
  let off = 0;

  const top = (statsData?.mostSoldProducts || []).slice(0, 5);
  const topMax = Math.max(1, ...top.map((t) => t._sum?.quantity || 0));

  return (
    <div className="pb-6">
      <OrderDetailModal isOpen={!!openOrder} onClose={() => setOpenOrder(null)} order={openOrder} />

      {/* Sarlavha */}
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <span className="lbl">
            {UZ_DAYS[now.getDay()]}, {now.getDate()}-{UZ_MONTHS[now.getMonth()]}
          </span>
          <h1 className="mt-2">
            {greet}
            {name ? `, ${name}` : ''}
          </h1>
          <p className="text-mute mt-1.5">
            Bugun {todayCount} ta yangi buyurtma
            {badges.orders > 0 ? `, ${badges.orders} tasi to'lovni kutmoqda` : ''}.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="inline-flex p-[3px] rounded-[10px] bg-s1 border border-line">
            {([7, 30] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDayRange(d)}
                className={cn(
                  'h-[30px] px-3 rounded-[7px] text-[13px] cursor-pointer',
                  dayRange === d ? 'bg-s3 text-ink' : 'text-mute',
                )}
              >
                {d} kun
              </button>
            ))}
          </div>
          <button
            onClick={exportCsv}
            className="h-[38px] px-4 rounded-[10px] inline-flex items-center gap-2 border border-line2 hover:bg-s2 cursor-pointer font-medium"
          >
            <Download size={17} strokeWidth={1.6} />
            Hisobot
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5 md:gap-3.5 mb-3.5">
        {kpis.map((k) => (
          <Card key={k.title} className="p-3.5 md:p-5">
            <span className="lbl">{k.title}</span>
            <div className="font-serif text-[22px] md:text-[30px] leading-tight mt-2.5 md:mt-3.5 mb-2 md:mb-2.5 tabular-nums">
              {k.value}
              {k.unit && <small className="font-sans text-[12px] md:text-[13px] text-mute2 ml-1">{k.unit}</small>}
            </div>
            <div className="flex items-center justify-between">
              <Delta value={k.delta as number | null} />
              <Spark data={k.spark} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.75fr_1fr] gap-3.5 mb-3.5">
        {/* Savdo grafigi */}
        <Card>
          <div className="flex items-center justify-between gap-3 px-5 pt-[18px] flex-wrap">
            <h3 className="font-semibold text-[15px]">Savdo dinamikasi</h3>
            <div className="flex gap-4 text-mute text-[12.5px]">
              <span className="flex items-center gap-1.5">
                <i className="w-2.5 h-[3px] rounded bg-star inline-block" />
                {dayRange === 7 ? 'Shu hafta' : 'Oxirgi 30 kun'}
              </span>
              {series.some((s) => s.prev !== undefined) && (
                <span className="flex items-center gap-1.5">
                  <i className="w-2.5 h-[3px] rounded bg-mute2 inline-block" />
                  O'tgan hafta
                </span>
              )}
            </div>
          </div>
          <div className="h-[220px] md:h-[280px] px-2 pt-4 pb-3">
            {series.length === 0 ? (
              <div className="h-full grid place-items-center text-mute2 text-sm">Ma'lumot yo'q</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 10, right: 14, left: 14, bottom: 0 }}>
                  <defs>
                    <linearGradient id="akbwSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--star)" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="var(--star)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--line)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--mute2)', fontSize: 11 }}
                    dy={8}
                    interval="preserveStartEnd"
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ stroke: 'var(--line2)' }}
                    contentStyle={{
                      background: 'var(--s3)',
                      border: 'none',
                      borderRadius: 10,
                      padding: '8px 12px',
                      color: 'var(--text)',
                    }}
                    labelStyle={{ color: 'var(--mute2)', fontSize: 11, marginBottom: 2 }}
                    itemStyle={{ color: 'var(--text)', fontSize: 13, fontWeight: 600, padding: 0 }}
                    formatter={(v: any, k: any) => [fmt(Number(v)), k === 'prev' ? "O'tgan hafta" : 'Savdo']}
                    labelFormatter={(_, p: any) => p?.[0]?.payload?.date || ''}
                  />
                  <Area
                    type="monotone"
                    dataKey="prev"
                    stroke="var(--mute2)"
                    strokeWidth={1.5}
                    strokeDasharray="4 5"
                    fill="none"
                    dot={false}
                    activeDot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="var(--star)"
                    strokeWidth={2.4}
                    fill="url(#akbwSales)"
                    dot={false}
                    activeDot={{ r: 5, fill: 'var(--s1)', stroke: 'var(--star)', strokeWidth: 2.4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Holatlar */}
        <Card>
          <div className="flex items-center justify-between px-5 pt-[18px]">
            <h3 className="font-semibold text-[15px]">Buyurtma holati</h3>
            <span className="lbl">{dayRange} kun</span>
          </div>
          <div className="px-5 pt-4 pb-5">
            <svg viewBox="0 0 200 200" className="w-[170px] block mx-auto mb-4">
              <circle cx="100" cy="100" r={R} fill="none" stroke="var(--s3)" strokeWidth={16} />
              {donutParts.map((p) => {
                const len = (p.v / donutTotal) * C;
                const el = (
                  <circle
                    key={p.k}
                    cx="100"
                    cy="100"
                    r={R}
                    fill="none"
                    stroke={stateOf(p.k).color}
                    strokeWidth={16}
                    strokeDasharray={`${Math.max(len - 3, 0.5)} ${C}`}
                    strokeDashoffset={-off}
                    transform="rotate(-90 100 100)"
                  />
                );
                off += len;
                return el;
              })}
              <text x="100" y="100" textAnchor="middle" fontSize="34" fill="var(--text)" fontFamily="var(--font-didot), Didot, Georgia, serif">
                {donutTotal}
              </text>
              <text x="100" y="122" textAnchor="middle" fontSize="10" letterSpacing="2" fill="var(--mute2)" fontFamily="var(--font-futura), Futura, sans-serif">
                BUYURTMA
              </text>
            </svg>
            {(donutParts.length ? donutParts : [{ k: 'PAID', v: 0 }]).map((p) => (
              <Link
                key={p.k}
                href={`/orders?status=${p.k}`}
                className="flex items-center py-1.5 hover:opacity-80"
              >
                <Pill state={p.k} />
                <span className="flex-1" />
                <b className="tabular-nums font-semibold">{p.v}</b>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {/* Oxirgi buyurtmalar */}
        <Card>
          <div className="flex items-center justify-between px-5 pt-[18px]">
            <h3 className="font-semibold text-[15px]">Oxirgi buyurtmalar</h3>
            <Link href="/orders" className="lbl !text-star hover:opacity-80">
              Hammasi →
            </Link>
          </div>
          <div className="px-5 pt-2 pb-4">
            {orders.length === 0 && <p className="text-mute2 text-sm py-6 text-center">Buyurtmalar yo'q</p>}
            {orders.slice(0, 5).map((o) => (
              <button
                key={o.id}
                onClick={() => setOpenOrder(o)}
                className="w-full flex items-center gap-3 py-[11px] border-t border-line first:border-t-0 text-left cursor-pointer hover:opacity-85"
              >
                <span className="w-[34px] h-[34px] rounded-full bg-s3 grid place-items-center text-[11px] font-semibold shrink-0">
                  {`${o.user?.name?.[0] || ''}${o.user?.lastName?.[0] || ''}`.toUpperCase() || '?'}
                </span>
                <span className="flex-1 min-w-0">
                  <b className="block font-medium truncate">
                    {o.user?.name} {o.user?.lastName}
                  </b>
                  <small className="text-mute2 text-xs">
                    #{o.id} ·{' '}
                    {new Date(o.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </small>
                </span>
                <span className="text-right">
                  <b className="block font-medium tabular-nums">{fmt(o.total_price)}</b>
                  <Pill state={o.state} className="!px-2 !py-0.5 mt-1" />
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* Top mahsulotlar */}
        <Card>
          <div className="flex items-center justify-between px-5 pt-[18px]">
            <h3 className="font-semibold text-[15px]">Top mahsulotlar</h3>
            <Link href="/statistics" className="lbl hover:text-ink">
              sotuv →
            </Link>
          </div>
          <div className="px-5 pt-2 pb-4">
            {top.length === 0 && <p className="text-mute2 text-sm py-6 text-center">Hali sotuv yo'q</p>}
            {top.map((t, i) => {
              const d = t.details || {};
              const title = d.translations?.[0]?.name || d.name || `Mahsulot #${t.productId}`;
              const img = d.images?.[0] || d.product_images?.[0];
              const q = t._sum?.quantity || 0;
              return (
                <Link
                  key={i}
                  href={`/products?view=${t.productId}&q=${encodeURIComponent(title)}`}
                  className="flex items-center gap-3 py-[11px] border-t border-line first:border-t-0 hover:opacity-85"
                >
                  <span className="w-[42px] h-[52px] rounded-lg bg-s3 overflow-hidden shrink-0">
                    {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <b className="block font-medium truncate">{title}</b>
                    <span className="block h-1.5 rounded-full bg-s3 overflow-hidden mt-[7px]">
                      <i className="block h-full bg-star rounded-full" style={{ width: `${(q / topMax) * 100}%` }} />
                    </span>
                  </span>
                  <b className="font-medium tabular-nums">{q}</b>
                </Link>
              );
            })}
          </div>
        </Card>

        {/* E'tibor talab qiladi */}
        <Card className="md:col-span-2 xl:col-span-1">
          <div className="px-5 pt-[18px]">
            <h3 className="font-semibold text-[15px]">E'tibor talab qiladi</h3>
          </div>
          <div className="px-5 pt-2 pb-4">
            {[
              {
                show: badges.orders > 0,
                icon: ShoppingBag,
                tone: 'text-star',
                title: `${badges.orders} ta buyurtma to'lovni kutmoqda`,
                sub: badges.pendingOrders[0] ? `Oxirgisi: #${badges.pendingOrders[0].id} · ${badges.pendingOrders[0].user?.name || ''}` : '',
                href: '/orders?status=PENDING',
              },
              {
                show: customs.length > 0,
                icon: Truck,
                tone: 'text-info',
                title: `${customs.length} ta yuk bojxonada`,
                sub: 'Yuklar bo\'limida holatni yangilang',
                href: '/shipments',
              },
              {
                show: badges.support > 0,
                icon: Headphones,
                tone: 'text-mute',
                title: `${badges.support} ta javobsiz murojaat`,
                sub: 'Yordam bo\'limi',
                href: '/support',
              },
              {
                show: cancelled > 0,
                icon: XCircle,
                tone: 'text-sale',
                title: `${cancelled} ta bekor qilingan buyurtma`,
                sub: `Oxirgi ${dayRange} kunda`,
                href: '/orders?status=CANCELLED',
              },
            ]
              .filter((x) => x.show)
              .map((x) => (
                <Link
                  key={x.title}
                  href={x.href}
                  className="flex items-center gap-3 py-[11px] border-t border-line first:border-t-0 hover:opacity-85"
                >
                  <span className={cn('w-[38px] h-[38px] rounded-[10px] border border-line grid place-items-center shrink-0', x.tone)}>
                    <x.icon size={18} strokeWidth={1.6} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <b className="block font-medium">{x.title}</b>
                    <small className="text-mute2 text-xs">{x.sub}</small>
                  </span>
                </Link>
              ))}
            {badges.orders === 0 && customs.length === 0 && badges.support === 0 && cancelled === 0 && (
              <p className="text-mute2 text-sm py-6 text-center">Hammasi joyida ✓</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
