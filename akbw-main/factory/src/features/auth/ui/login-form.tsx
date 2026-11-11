'use client';

import {
  Button
} from '@/shared/ui/button';
import {
  Input
} from '@/shared/ui/input';
import {
  useLoginFactory
} from '../lib/hooks';
import {
  Loader2
} from 'lucide-react';
import React, {
  useState
} from 'react';
import Link from 'next/link';

export default function LoginForm() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useLoginFactory();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ login, password });
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-[32px] shadow-2xl shadow-black/5 border border-gray-100">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-black uppercase tracking-tight">Xush kelibsiz</h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">
          Hamkorlar paneliga kirish
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
            Login
          </label>
          <Input
            placeholder="Loginingizni kiriting"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="h-12 rounded-2xl border-gray-100 font-bold focus:ring-black/5"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
            Parol
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-2xl border-gray-100 font-bold focus:ring-black/5"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full h-14 rounded-2xl bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
        >
          {loginMutation.isPending ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            'Kirish'
          )}
        </Button>

      </form>
    </div>
  );
}
