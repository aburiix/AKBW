export interface IDeliveryCalculateRequest {
  products: {
    productId: string;
    quantity: string;
  }[];
  receiverCityCode: string;
}
