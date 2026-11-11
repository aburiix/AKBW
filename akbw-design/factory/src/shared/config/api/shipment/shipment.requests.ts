import httpClient from "../httpClient";
import {
    ENDP_SHIPMENT_FACTORY,
    ENDP_SHIPMENT_STATES,
    ENDP_SHIPMENT_UPDATE_STATUS
} from "../URLs";

export const getFactoryShipments = async (state?: string) => {
    return (await httpClient.get(ENDP_SHIPMENT_FACTORY, { params: { state } })).data
};

export const getShipmentStates = async () => {
    return (await httpClient.get(ENDP_SHIPMENT_STATES)).data
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
    return (await httpClient.patch(ENDP_SHIPMENT_UPDATE_STATUS(shipmentId), {
      state: newState,
      ...(senderBranchCode && { senderBranchCode }),
      ...(senderCityCode && { senderCityCode }),
      ...(senderRegionCode && { senderRegionCode }),
    })).data
};