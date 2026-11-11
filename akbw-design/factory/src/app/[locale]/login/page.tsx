'use client';

import { useFactoryAuthStore } from '@/features/auth/model/auth.store';
import LoginForm from '@/features/auth/ui/login-form';

export default function LoginPage() {
  return (
    <main className="h-screen flex items-center justify-center bg-[#fafafa] py-12 px-4">
      <LoginForm />
    </main>
  );
}
