export interface IDeliveryFromToLink {
    shipmentIds: string[];
}

export interface IDeliveryFromToLinkResponse {
    shipmentId: string;
    fromLink: string;
    toLink: string;
    fromBranchName: string;
    toBranchName: string;
}

export interface ISenderConfig {
    id?: number;
    name: string;
    phone: string;
    address: string;
    region_code: string;
    city_code: string;
    branch_code: string;
    lat_long?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ISenderConfigResponse {
    status: boolean;
    message: string;
    data: ISenderConfig | null;
}

export interface IDistanceRequest {
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
}

export interface IDistanceResponse {
    status: boolean;
    message: string;
    data: {
        distanceKm: number;
        durationMin: number;
    };
}