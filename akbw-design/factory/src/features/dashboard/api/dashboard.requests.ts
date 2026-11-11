import httpClient from '@/shared/config/api/httpClient';
import { ENDP_FACTORY_DASHBOARD } from '@/shared/config/api/URLs';

export const getFactoryStatsRequest = async () => {
  return (await httpClient.get(`${ENDP_FACTORY_DASHBOARD}/stats`)).data;
};
