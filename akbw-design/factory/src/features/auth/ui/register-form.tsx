'use client';

import React, {
  useState
} from 'react';
import {
  useRegisterFactory
} from '../lib/hooks';
import {
  Input
} from '@/shared/ui/input';
import {
  Button
} from '@/shared/ui/button';
import {
  Loader2
} from 'lucide-react';
import Link from 'next/link';


export default function RegisterForm() {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    name: '',
    phone: '',
    adress: '',
    bts_code: '',
    bank_name: '',
    bank_account: '',
    bank_mfo: '',
    bank_inn: '',
  });

  const registerMutation = useRegisterFactory();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  return (
    <div className="w-full max-w-2xl p-10 bg-white rounded-[40px] shadow-2xl shadow-black/5 border border-gray-100">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black uppercase tracking-tight">Hamkorlikni boshlang</h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-3 underline decoration-black/10">
          Ro‘yxatdan o‘tib, mahsulotlaringizni sotishni boshlang
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Info */}
          <div className="space-y-5">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-black/20 pb-2 border-b border-gray-50 flex items-center justify-between">
              Asosiy ma'lumotlar
            </h3>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Login</label>
              <Input name="login" placeholder="Loginingiz" className="h-12 rounded-2xl border-gray-100 font-bold focus:ring-black/5" onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Parol</label>
              <Input name="password" type="password" placeholder="••••••••" className="h-12 rounded-2xl border-gray-100 font-bold focus:ring-black/5" onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Kompaniya nomi (Zavod)</label>
              <Input name="name" placeholder="Masalan: AKBW Factory" className="h-12 rounded-2xl border-gray-100 font-bold focus:ring-black/5" onChange={handleChange} required />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-5">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-black/20 pb-2 border-b border-gray-50">Bog'lanish</h3>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Telefon</label>
              <Input name="phone" placeholder="+998..." className="h-12 rounded-2xl border-gray-100 font-bold focus:ring-black/5" onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Manzil</label>
              <Input name="adress" placeholder="To'liq manzilni kiriting" className="h-12 rounded-2xl border-gray-100 font-bold focus:ring-black/5" onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">BTS Kodi</label>
              <Input name="bts_code" placeholder="Masalan: 12345" className="h-12 rounded-2xl border-gray-100 font-bold focus:ring-black/5" onChange={handleChange} required />
            </div>
          </div>
        </div>

        {/* Bank Info */}
        <div className="space-y-5 px-6 py-8 bg-gray-50/50 rounded-3xl border border-gray-100">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-black/20 pb-2 border-b border-gray-100 italic">
            To'lov ma'lumotlari (Bank rekvizitlari)
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Bank nomi</label>
              <Input name="bank_name" placeholder="Masalan: NBU" className="h-12 rounded-2xl border-none font-bold shadow-sm" onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Hisob raqami</label>
              <Input name="bank_account" placeholder="2021..." className="h-12 rounded-2xl border-none font-bold shadow-sm" onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">MFO</label>
              <Input name="bank_mfo" placeholder="00444" className="h-12 rounded-2xl border-none font-bold shadow-sm" onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">INN</label>
              <Input name="bank_inn" placeholder="123456789" className="h-12 rounded-2xl border-none font-bold shadow-sm" onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full h-16 rounded-[24px] bg-black text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-black/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
          >
            {registerMutation.isPending ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              'Profili yaratish'
            )}
          </Button>
        </div>
      </form>

      <div className="mt-10 text-center">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Allaqachon profilingiz bormi?{' '}
          <Link href="/login" className="text-black hover:underline underline-offset-4 font-black">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  );
}