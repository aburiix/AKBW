'use client';

import React from 'react';
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Search,
  Filter,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

import { useTransactions } from '../lib/hook';
import { TransactionState } from '@/shared/config/api/transactions/transactions.model';
import dayjs from 'dayjs';

export default function Payments() {
  const { data, isLoading } = useTransactions();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('Barcha Statuslar');

  const transactions = data?.transactions || [];

  const stats = React.useMemo(() => {
    const lastWeek = dayjs().subtract(7, 'day');

    const weeklyRevenue = transactions
      .filter(t => t.state === TransactionState.PAID && dayjs(t.create_time).isAfter(lastWeek))
      .reduce((sum, t) => sum + t.amount, 0);

    const refunds = transactions
      .filter(t => [TransactionState.CANCELLED, TransactionState.PAID_CANCELLED, TransactionState.PENDING_CANCELLED].includes(t.state))
      .reduce((sum, t) => sum + t.amount, 0);

    const pending = transactions
      .filter(t => t.state === TransactionState.PENDING)
      .reduce((sum, t) => sum + t.amount, 0);

    return { weeklyRevenue, refunds, pending };
  }, [transactions]);

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((t) => {
      const customerName = `${t.user?.name || ''} ${t.user?.lastName || ''}`.toLowerCase();
      const matchesSearch =
        customerName.includes(searchQuery.toLowerCase()) ||
        t.amount.toString().includes(searchQuery) ||
        t.payment_provider_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.order_id.toString().includes(searchQuery);

      const matchesStatus =
        filterStatus === 'Barcha Statuslar' || t.state === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchQuery, filterStatus]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(val);
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Order',
      'Customer',
      'Amount',
      'Method',
      'Status',
      'Date',
    ];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map((t) =>
        [
          t.payment_provider_id,
          `#${t.order_id}`,
          `${t.user?.name} ${t.user?.lastName}`,
          t.amount,
          t.provider,
          t.state,
          dayjs(t.create_time).format('DD.MM.YYYY HH:mm'),
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'transactions.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            To‘lovlar
          </h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Tranzaksiyalar va moliyaviy oqim boshqaruvi
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          className="rounded-2xl bg-white text-black border border-gray-100 px-6 py-4 h-auto font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-sm hover:bg-gray-50 transition-all cursor-pointer"
        >
          <Download size={16} />
          Export CSV
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">
            Tushum (Haftalik)
          </h3>
          <p className="text-2xl font-black">{formatCurrency(stats.weeklyRevenue)}</p>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
              <ArrowDownRight size={20} />
            </div>
          </div>
          <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">
            Vozvratlar (Qaytarilgan)
          </h3>
          <p className="text-2xl font-black">{formatCurrency(stats.refunds)}</p>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <CreditCard size={20} />
            </div>
          </div>
          <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">
            Kutilayotgan to‘lovlar
          </h3>
          <p className="text-2xl font-black">{formatCurrency(stats.pending)}</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex gap-4 items-center">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="pl-12 h-11 bg-gray-50 border-none rounded-xl text-sm"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-xl border-gray-100 h-11 px-4 cursor-pointer gap-2 flex items-center min-w-[140px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <Filter size={18} />
                  <span className="text-[10px] font-bold uppercase truncate max-w-[80px]">
                    {filterStatus === 'Barcha Statuslar'
                      ? 'Filter'
                      : filterStatus}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-2xl border-gray-100 p-2 shadow-xl min-w-[200px]"
            >
              <DropdownMenuLabel className="text-[10px] uppercase tracking-widest font-black text-gray-400 px-3 py-2">
                Status bo'yicha
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setFilterStatus('Barcha Statuslar')}
                className="rounded-xl px-3 py-2 cursor-pointer text-xs font-bold uppercase"
              >
                Barcha Statuslar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterStatus(TransactionState.PAID)}
                className="rounded-xl px-3 py-2 cursor-pointer text-xs font-bold uppercase"
              >
                Paid
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterStatus(TransactionState.PENDING)}
                className="rounded-xl px-3 py-2 cursor-pointer text-xs font-bold uppercase"
              >
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilterStatus(TransactionState.CANCELLED)}
                className="rounded-xl px-3 py-2 cursor-pointer text-xs font-bold uppercase"
              >
                Cancelled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-left text-[10px] uppercase tracking-widest font-black text-gray-400">
                  Tranzaksiya
                </th>
                <th className="px-8 py-4 text-left text-[10px] uppercase tracking-widest font-black text-gray-400">
                  Mijoz / Order
                </th>
                <th className="px-8 py-4 text-left text-[10px] uppercase tracking-widest font-black text-gray-400">
                  Summa
                </th>
                <th className="px-8 py-4 text-left text-[10px] uppercase tracking-widest font-black text-gray-400">
                  Method
                </th>
                <th className="px-8 py-4 text-left text-[10px] uppercase tracking-widest font-black text-gray-400">
                  Status
                </th>
                <th className="px-8 py-4 text-left text-[10px] uppercase tracking-widest font-black text-gray-400">
                  Sana
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-all">
                  <td className="px-8 py-5">
                    <p className="text-sm font-black uppercase truncate max-w-[120px]" title={t.payment_provider_id}>
                      {t.payment_provider_id}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold uppercase">
                      {t.user?.name} {t.user?.lastName}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      #{t.order_id}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-black">{formatCurrency(t.amount)}</p>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {t.provider}
                  </td>
                  <td className="px-8 py-5">
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border',
                        t.state === TransactionState.PAID
                          ? 'bg-green-50 text-green-600 border-green-100'
                          : t.state === TransactionState.PENDING
                            ? 'bg-orange-50 text-orange-600 border-orange-100'
                            : 'bg-red-50 text-red-600 border-red-100',
                      )}
                    >
                      {t.state}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-xs text-gray-400 font-bold uppercase">
                    {dayjs(t.create_time).format('DD.MM.YYYY HH:mm')}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-10 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    Tranzaksiyalar topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
