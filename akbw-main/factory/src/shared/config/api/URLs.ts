export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.akbw.uz/api';

export const ENDP_FACTORY_AUTH = '/factory/auth';
export const ENDP_FACTORY_DASHBOARD = '/factory/dashboard';
export const ENDP_FACTORY_ORDERS = '/factory/orders';
export const ENDP_FACTORY_WORKERS = '/factory/workers';
export const ENDP_SHIPMENT_FACTORY = '/shipment/factory';
export const ENDP_SHIPMENT_STATES = '/shipment/states';
export const ENDP_DELIVERY_FROM_TO_LINKS = "/delivery/from-to-links";
export const ENDP_DELIVERY_REGIONS = '/delivery/regions';
export const ENDP_DELIVERY_CITIES = '/delivery/cities';
export const ENDP_DELIVERY_BRANCHES = "/delivery/branches";
export const ENDP_SHIPMENT_UPDATE_STATUS = (shipment_id: number) => `/shipment/${shipment_id}/status`;
