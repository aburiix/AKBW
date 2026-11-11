'use client';

import React from 'react';
import { StatsCard } from './stats-card';
import { useGetFactoryStats } from '../lib/hooks';
import {
  ShoppingBag,
  PackageCheck,
  RotateCcw,
  Wallet,
  TrendingUp,
  Package,
  Users
} from 'lucide-react';
import { formatPriceSync } from '@/shared/lib/formatPriceSync';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useGetFactoryShipments } from '@/features/shipments/lib/hooks';
import { cn } from '@/shared/lib/utils';
import Link from 'next/link';

export function DashboardView() {
  const { data: statsData, isLoading: isStatsLoading } = useGetFactoryStats();
  const { data: ordersData, isLoading: isOrdersLoading } = useGetFactoryShipments();

  const stats = statsData?.stats;
  const recentOrders = ordersData?.orderItems?.slice(0, 5) || [];

  const chartData = [
    { name: 'Dush', sales: 4000 },
    { name: 'Sesh', sales: 3000 },
    { name: 'Chor', sales: 2000 },
    { name: 'Pay', sales: 2780 },
    { name: 'Jum', sales: 1890 },
    { name: 'Shan', sales: 2390 },
    { name: 'Yak', sales: 3490 },
  ];

  if (isStatsLoading || isOrdersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-400 font-black uppercase tracking-[0.3em] text-xs">
          Yuklanmoqda...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-10">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter">Boshqaruv paneli</h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">
          Sizning bugungi va umumiy ko‘rsatkichlaringiz
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Bugungi buyurtmalar"
          value={stats?.todayOrdersCount || 0}
          icon={ShoppingBag}
          isLoading={isStatsLoading}
          trend="+12% bugun"
        />
        <StatsCard
          title="Sotilgan mahsulotlar"
          value={stats?.totalSold || 0}
          icon={PackageCheck}
          isLoading={isStatsLoading}
        />
        <StatsCard
          title="Qaytarilganlar"
          value={stats?.totalRefunds || 0}
          icon={RotateCcw}
          isLoading={isStatsLoading}
          className={stats?.totalRefunds > 0 ? "border-red-100" : ""}
        />
        <StatsCard
          title="Balans"
          value={stats?.balance ? `${formatPriceSync(stats.balance)} UZS` : '0 UZS'}
          icon={Wallet}
          isLoading={isStatsLoading}
          className="bg-black text-white border-none shadow-2xl shadow-black/20"
        />
        <StatsCard
          title="Ishchilar"
          value={stats?.workersCount || 0}
          icon={Users}
          isLoading={isStatsLoading}
          trend="Xodimlar soni"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Area Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-xl font-black uppercase tracking-wider">
                Sotuvlar Grafikasi
              </h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                Haftalik hisobot
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl">
              <TrendingUp size={20} className="text-black" />
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 900 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: '24px',
                    border: 'none',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                    padding: '16px 20px',
                  }}
                  labelStyle={{
                    fontWeight: 900,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#000"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-xl font-black uppercase tracking-wider mb-8">
            So'nggi buyurtmalar
          </h2>
          <div className="space-y-6 flex-1">
            {recentOrders.length > 0 ? (
              recentOrders.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between group hover:bg-gray-50/50 p-2 rounded-2xl transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase truncate max-w-[120px]">
                        {item.product?.translations?.[0]?.name || 'Mahsulot'}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {item.size?.translations?.[0]?.name || 'O‘lcham yo‘q'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-black">
                      {formatPriceSync(item.price)}
                    </p>
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      item.status === 'new' ? "text-blue-500" : "text-gray-400"
                    )}>
                      {item.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 italic">Buyurtmalar yo'q</p>
              </div>
            )}
          </div>
          <Link
            href="/uz/orders"
            className="w-full mt-10 py-5 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-black hover:text-white transition-all cursor-pointer"
          >
            Barchasini ko‘rish
          </Link>
        </div>
      </div>
    </div>
  );
}
