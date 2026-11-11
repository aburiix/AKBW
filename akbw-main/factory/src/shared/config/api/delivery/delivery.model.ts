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