'use client';

import React, { useState } from 'react';
import { useAdminAuthStore } from '@/shared/store/auth.store';
import { ShieldCheck, Phone, Lock } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { toast } from 'sonner';
import { extractError } from '@/shared/lib/extractError';
import { adminLoginRequest } from '@/shared/config/api/admin/admin.request';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setAdminToken } = useAdminAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || phone.trim().length === 0) {
      toast.error("Telefon raqami kiritilmadi");
      return;
    }

    if (!password || password.trim().length === 0) {
      toast.error("Parol kiritilmadi");
      return;
    }

    setIsLoading(true);
    try {
      const res = await adminLoginRequest({ phone, password });
      if (res.ok) {
        setAdminToken(res.token, res.refreshToken, res.admin?.access);
      } else {
        toast.error(res.message || "Login xatolik");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(extractError(error) || "Noto'g'ri telefon raqami yoki parol");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-[28px] bg-black flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-black/20">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
            AKBW ADMIN
          </h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
            Dashboard'ga kirish telefon raqam va parol orqali
          </p>
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-2xl shadow-black/5">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block px-1">
                Telefon raqami
              </label>
              <div className="relative group">
                <Phone
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors"
                  size={20}
                />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 XX XXX XX XX"
                  className="pl-14 h-16 bg-gray-50 border-none rounded-3xl font-bold text-lg tracking-widest focus:ring-2 focus:ring-black/5 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block px-1">
                Parol
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors"
                  size={20}
                />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-14 h-16 bg-gray-50 border-none rounded-3xl font-bold text-lg tracking-widest focus:ring-2 focus:ring-black/5 transition-all"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-16 bg-black text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Tekshirilmoqda..." : "Kirish"}
            </Button>
          </form>

          <div className="mt-8 text-center px-4">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
              Xavfsizlik yuzasidan barcha amallar tizimda qayd etiladi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
