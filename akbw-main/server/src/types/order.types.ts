import type { Products } from "../generated/prisma/client/index.js";

export interface IOrderItem {
    productId: number;
    quantity: number;
    sizeId: number;
    colorId: number;
}

export interface IOrder {
  id: number;
  price: number;
  product_images: string[];
  categories: {
    id: number;
  }[];
  sizes: {
    id: number;
  }[];
  colors: {
    id: number;
  }[];
  translations: {
    id: number;
  }[];
  type: IFulFillmentType;
  factory_id?: number;
  weight: number;
  volume_x: number;
  volume_y: number;
  volume_z: number;
  factory?: {
    id: number;
  };
  discount: number;
  reviews: {
    id: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
  orderItems: IOrderItem[];
}

export type IFulFillmentType = "SELF" | "FACTORY";

export type GroupedItems = {
  shipmentKey: string;
  type: IFulFillmentType;
  factoryId?: number;
  items: {
    item: IOrderItem;
    product: Products;
  }[];
};