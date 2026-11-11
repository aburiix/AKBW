import { useMutation, useQuery } from '@tanstack/react-query';
import { adminMeRequest } from '@/shared/config/api/admin/admin.request';
import { useAdminAuthStore } from '@/shared/store/auth.store';
import { useEffect } from 'react';

export const useAdminMe = () => {
  const { setAdminAccess } = useAdminAuthStore();
  const query = useQuery({
    queryKey: ['admin-me'],
    queryFn: () => adminMeRequest(),
  });

  useEffect(() => {
    if (query.data?.admin?.access) {
      setAdminAccess(query.data.admin.access);
    }
  }, [query.data, setAdminAccess]);

  return query;
};
