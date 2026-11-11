import httpClient from "../httpClient";
import { IDeliveryFromToLink } from "./delivery.model";
import { ENDP_DELIVERY_FROM_TO_LINKS } from "../URLs";

export const getDeliveryFromToLinks = async(body: IDeliveryFromToLink) => {
    const response = await httpClient.post(ENDP_DELIVERY_FROM_TO_LINKS, body);
    return response.data;
};