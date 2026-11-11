'use client';

import {
  Button
} from '@/shared/ui/button';
import {
  Input
} from '@/shared/ui/input';
import {
  useRegisterFactory
} from '../lib/hooks';
import {
  Loader2,
  Building2,
  Phone,
  MapPin,
  Lock,
  User,
  CreditCard
} from 'lucide-react';
import React, {
  useState
} from 'react';
import Link from 'next/link';

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    name: '',
    phone: '',
    adress: '', // Matches Prisma schema typo 'adress'
    bank_name: '',
    bank_account: '',
    bank_mfo: '',
    bank_inn: '',
  });

  const registerMutation = useRegisterFactory();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  return (
    <div className="w-full max-w-2xl p-8 bg-white rounded-[40px] shadow-2xl shadow-black/5 border border-gray-100 mt-10 mb-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Ro‘yxatdan o‘tish</h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">
          Yangi hamkor sifatida qo‘shiling
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
              Login
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                name="login"
                placeholder="foydalanuvchi_nomi"
                value={formData.login}
                onChange={handleChange}
                className="h-14 pl-12 rounded-2xl border-gray-100 font-bold focus:ring-black/5 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
              Parol
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="h-14 pl-12 rounded-2xl border-gray-100 font-bold focus:ring-black/5 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
              Kompaniya nomi
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                name="name"
                placeholder="AKBW Factory"
                value={formData.name}
                onChange={handleChange}
                className="h-14 pl-12 rounded-2xl border-gray-100 font-bold focus:ring-black/5 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
              Telefon
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                name="phone"
                placeholder="+998 90 123 45 67"
                value={formData.phone}
                onChange={handleChange}
                className="h-14 pl-12 rounded-2xl border-gray-100 font-bold focus:ring-black/5 transition-all"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
            Manzil
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              name="adress"
              placeholder="Toshkent sh., Yunusobod tumani..."
              value={formData.adress}
              onChange={handleChange}
              className="h-14 pl-12 rounded-2xl border-gray-100 font-bold focus:ring-black/5 transition-all"
              required
            />
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="pt-6 border-t border-gray-50">
          <div className="mb-6">
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <CreditCard size={18} />
              Bank rekvizitlari
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
                Bank nomi
              </label>
              <Input
                name="bank_name"
                placeholder="Bank nomi"
                value={formData.bank_name}
                onChange={handleChange}
                className="h-14 rounded-2xl border-gray-100 font-bold focus:ring-black/5 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
                Hisob raqami
              </label>
              <Input
                name="bank_account"
                placeholder="2020 8000 1234 5678"
                value={formData.bank_account}
                onChange={handleChange}
                className="h-14 rounded-2xl border-gray-100 font-bold focus:ring-black/5 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
                MFO
              </label>
              <Input
                name="bank_mfo"
                placeholder="00444"
                value={formData.bank_mfo}
                onChange={handleChange}
                className="h-14 rounded-2xl border-gray-100 font-bold focus:ring-black/5 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
                INN
              </label>
              <Input
                name="bank_inn"
                placeholder="123456789"
                value={formData.bank_inn}
                onChange={handleChange}
                className="h-14 rounded-2xl border-gray-100 font-bold focus:ring-black/5 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full h-16 rounded-[24px] bg-black text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-black/20 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
          >
            {registerMutation.isPending ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              'Ro‘yxatdan o‘tish'
            )}
          </Button>

          <p className="text-center mt-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Hisobingiz bormi?{' '}
            <Link href="/uz/login" className="text-black hover:underline underline-offset-4">
              Kirish
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
