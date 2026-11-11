import httpClient from "../httpClient"
import { ENDP_SHIPMENT } from "../URLs"

export const getOrderShipments = async (id: string, state?: string) => {
    return (await httpClient.get(ENDP_SHIPMENT + id, { params: { state } })).data;
};

export const getAdminShipments = async (state?: string) => {
    return (await httpClient.get(ENDP_SHIPMENT + 'admin', { params: { state } })).data;
};

export const getShipmentStates = async () => {
    return (await httpClient.get(ENDP_SHIPMENT + 'states')).data;
};

export const updateShipmentStatus = async ({ 
  shipmentId, 
  newState, 
  senderBranchCode, 
  senderCityCode, 
  senderRegionCode 
}: { 
  shipmentId: number; 
  newState: string; 
  senderBranchCode?: string; 
  senderCityCode?: string; 
  senderRegionCode?: string; 
}) => {
    return (await httpClient.patch(ENDP_SHIPMENT + shipmentId + '/status', { 
      state: newState,
      ...(senderBranchCode && { senderBranchCode }),
      ...(senderCityCode && { senderCityCode }),
      ...(senderRegionCode && { senderRegionCode }),
    })).data;
};