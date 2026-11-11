import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFactoriesRequest,
  createFactoryRequest,
  updateFactoryRequest,
  deleteFactoryRequest,
} from '@/shared/config/api/factory/factory.requests';
import type { ICreateFactory } from '@/shared/config/api/factory/factory.model';
import {
  getRegionsRequest,
  getCitiesRequest,
  getBranchesRequest,
} from '@/shared/config/api/bts/bts.requests';
import type { IGetBranchesRequest } from '@/shared/config/api/bts/bts.model';
import { toast } from 'sonner';
import { extractError } from '@/shared/lib/extractError';

export const useFactories = () => {
  return useQuery({
    queryKey: ['factories'],
    queryFn: getFactoriesRequest,
  });
};

export const useCreateFactory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (factory: ICreateFactory) => createFactoryRequest(factory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factories'] });
      toast.success('Zavod muvaffaqiyatli qo‘shildi');
    },
    onError: (error) => {
      toast.error(extractError(error) || 'Zavod qo‘shishda xatolik yuz berdi');
    },
  });
};

export const useUpdateFactory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, factory }: { id: number; factory: ICreateFactory }) =>
      updateFactoryRequest(id, factory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factories'] });
      toast.success('Zavod muvaffaqiyatli yangilandi');
    },
    onError: (error) => {
      toast.error(extractError(error) || 'Zavod yangilashda xatolik yuz berdi');
    },
  });
};

export const useDeleteFactory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteFactoryRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factories'] });
      toast.success('Zavod muvaffaqiyatli o‘chirildi');
    },
    onError: (error) => {
      toast.error(extractError(error) || 'Zavod o‘chirishda xatolik yuz berdi');
    },
  });
};
export const useBtsRegions = () => {
  return useQuery({
    queryKey: ['bts-regions'],
    queryFn: getRegionsRequest,
  });
};

export const useBtsCities = (regionCode: string) => {
  return useQuery({
    queryKey: ['bts-cities', regionCode],
    queryFn: () => getCitiesRequest(regionCode),
    enabled: !!regionCode,
  });
};

export const useGetBranches = (body: IGetBranchesRequest) => {
  return useQuery({
    queryKey: ['bts-branches', body],
    queryFn: () => getBranchesRequest(body),
    enabled: !!body.regionCode && !!body.cityCode,
  });
};