'use client';

import { ReactNode, useEffect, useState } from 'react';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { errorText, isIgnorable, notifyError, wasNotified } from '@/shared/lib/notify-error';
import { useUserStore } from '@/shared/store/user.store';

// 401: mehmon (token yo'q) uchun jim — u hali kirmagan, bu xato emas.
const skip401 = (error: unknown) =>
  isAxiosError(error) && error.response?.status === 401 && !useUserStore.getState().token;

const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // Har bir yuklanmagan ma'lumot haqida xabar (meta: { silent: true } bilan o'chiriladi)
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (query.meta?.silent || skip401(error)) return;
            if (query.meta?.ignore404 && isAxiosError(error) && error.response?.status === 404) return;
            notifyError(error, query.meta?.errorMessage as string | undefined);
          },
        }),
        // Amal (saqlash, yuborish…) xatosi: komponent o'zi onError bilan ko'rsatmagan bo'lsa — umumiy xabar
        mutationCache: new MutationCache({
          onError: (error, _v, _c, mutation) => {
            if (mutation.options.onError || mutation.meta?.silent || skip401(error)) return;
            // mutateAsync'ni try/catch'da o'zi ushlagan komponentga navbat beramiz: u ko'rsatsa, bu jim qoladi
            setTimeout(() => {
              if (!wasNotified(error)) notifyError(error, mutation.meta?.errorMessage as string | undefined);
            }, 0);
          },
        }),
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 1000 * 60 * 5,
            refetchOnReconnect: false,
          },
        },
      }),
  );

  // Kutilmagan JS xatolari, ushlanmagan Promise'lar va internet uzilishi ham jim qolmaydi
  useEffect(() => {
    const onRejection = (e: PromiseRejectionEvent) => {
      if (isIgnorable(e.reason) || skip401(e.reason) || wasNotified(e.reason)) return;
      notifyError(e.reason);
    };
    const onErr = (e: ErrorEvent) => {
      // tashqi skript / rasm xatolari (error obyekti yo'q) va zararsiz ogohlantirishlar o'tkazib yuboriladi
      if (!e.error || isIgnorable(e.error)) return;
      notifyError(e.error);
    };
    const offline = () => toast.error(errorText('offline'), { id: 'net', duration: Infinity });
    const online = () => toast.success(errorText('online'), { id: 'net', duration: 3000 });
    window.addEventListener('unhandledrejection', onRejection);
    window.addEventListener('error', onErr);
    window.addEventListener('offline', offline);
    window.addEventListener('online', online);
    if (navigator.onLine === false) offline();
    return () => {
      window.removeEventListener('unhandledrejection', onRejection);
      window.removeEventListener('error', onErr);
      window.removeEventListener('offline', offline);
      window.removeEventListener('online', online);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default QueryProvider;
