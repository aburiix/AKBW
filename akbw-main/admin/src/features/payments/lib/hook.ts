import { useQuery } from '@tanstack/react-query';
import { getTransactionsRequest } from '@/shared/config/api/transactions/transactions.request';

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => getTransactionsRequest(),
  });
};
