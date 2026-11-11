import httpClient from '../httpClient';
import { ENDP_DELIVERY_REGIONS, ENDP_DELIVERY_CITIES, ENDP_DELIVERY_BRANCHES } from '../URLs';
import { IBtsRegion, IBtsCity, IBtsResponse, IGetBranchesRequest, IBtsBranch } from './bts.model';

export const getRegionsRequest = async (): Promise<IBtsResponse<IBtsRegion>> => {
  return (await httpClient.get(ENDP_DELIVERY_REGIONS)).data;
};

export const getCitiesRequest = async (
  regionCode: string,
): Promise<IBtsResponse<IBtsCity>> => {
  return (await httpClient.get(ENDP_DELIVERY_CITIES, { params: { regionCode } }))
    .data;
};

export const getBranchesRequest = async(body: IGetBranchesRequest):Promise<IBtsResponse<IBtsBranch>> => {
  return (await httpClient.get(ENDP_DELIVERY_BRANCHES, {
    params: body,
  })).data;
};