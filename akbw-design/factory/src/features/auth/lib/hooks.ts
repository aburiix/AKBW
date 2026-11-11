import { useMutation, useQuery } from '@tanstack/react-query';
import {
  registerFactoryRequest,
  loginFactoryRequest,
  getMeFactoryRequest,
} from '@/shared/config/api/factory/factoryAuth.requests';
import { useFactoryAuthStore } from '../model/auth.store';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

export const useRegisterFactory = () => {
  const setAuth = useFactoryAuthStore((state) => state.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: registerFactoryRequest,
    onSuccess: (data) => {
      if (data.ok) {
        setAuth(data.token, data.factory);
        toast.success(data.message || 'Muvaffaqiyatli ro‘yxatdan o‘tdingiz');
        router.push('/');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    },
  });
};

export const useLoginFactory = () => {
  const setAuth = useFactoryAuthStore((state) => state.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: loginFactoryRequest,
    onSuccess: (data) => {
      if (data.ok) {
        setAuth(data.token, data.factory);
        toast.success(data.message || 'Xush kelibsiz!');
        router.push('/dashboard');
      }
    },
    onError: (error: any) => {
      console.log('err: ', error);
      toast.error(error.response?.data?.message || 'Login yoki parol noto‘g‘ri');
    },
  });
};

export const useGetMeFactory = () => {
  const token = useFactoryAuthStore((state) => state.token);
  return useQuery({
    queryKey: ['factoryMe'],
    queryFn: getMeFactoryRequest,
    enabled: !!token,
  });
};
