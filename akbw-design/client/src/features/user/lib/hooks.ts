import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userRequest } from '@/shared/config/api/user/user.request';
import { IUpdateUserRequest } from '@/shared/config/api/user/user.model';
import { useUserStore } from '@/shared/store/user.store';
import { onError } from '@/shared/config/api/isAxiosError';
import { useTranslations } from 'next-intl';

export const useUser = () => {
  const { token } = useUserStore();
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => userRequest.getMe(),
    enabled: !!token,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const t = useTranslations('Common');
  return useMutation({
    mutationFn: (data: IUpdateUserRequest) => userRequest.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
    onError: (err) => onError(err, t('error')),
  });
};
