import { useQuery } from '@tanstack/react-query';
import { getFactoryStatsRequest } from '../api/dashboard.requests';

export const useGetFactoryStats = () => {
  return useQuery({
    queryKey: ['factoryStats'],
    queryFn: getFactoryStatsRequest,
    refetchInterval: 5000, // Pooling for "Real-time" effect mentioned by user
  });
};
