import httpClient from '../httpClient';
import { ENDP_TRANSACTIONS } from '../URLs';
import { ITransaction } from './transactions.model';

export const getTransactionsRequest = async (): Promise<{ transactions: ITransaction[] }> => {
  return (await httpClient.get(ENDP_TRANSACTIONS)).data;
};
