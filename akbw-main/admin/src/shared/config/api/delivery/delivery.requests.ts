import httpClient from "../httpClient";
import { IDeliveryFromToLink, ISenderConfig, IDistanceRequest } from "./delivery.model";
import { ENDP_DELIVERY_FROM_TO_LINKS, ENDP_DELIVERY_SENDER_CONFIG, ENDP_DELIVERY_DISTANCE } from "../URLs";

export const getDeliveryFromToLinks = async(body: IDeliveryFromToLink) => {
    const response = await httpClient.post(ENDP_DELIVERY_FROM_TO_LINKS, body);
    return response.data;
};

export const getSenderConfigRequest = async () => {
    const response = await httpClient.get(ENDP_DELIVERY_SENDER_CONFIG);
    return response.data;
};

export const saveSenderConfigRequest = async (config: ISenderConfig) => {
    const response = await httpClient.put(ENDP_DELIVERY_SENDER_CONFIG, config);
    return response.data;
};

export const getDistanceRequest = async (body: IDistanceRequest) => {
    const response = await httpClient.post(ENDP_DELIVERY_DISTANCE, body);
    return response.data;
};