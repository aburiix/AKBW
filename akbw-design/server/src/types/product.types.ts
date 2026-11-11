import type { IFulFillmentType, IOrderItem } from "./order.types";

export interface IProduct {
  id?: number;
  price: number;
  product_images: string[];
  categories: { id: number }[];
  sizes: { id: number }[];
  colors: { id: number }[];
  translations: { id: number }[];
  type: IFulFillmentType;
  factory_id?: number;
  weight: number;
  volume_x: number;
  volume_y: number;
  volume_z: number;
  factory?: { id: number };
  discount: number;
  reviews: { id: number }[];
  createdAt?: Date;
  updatedAt?: Date;
  orderItems: IOrderItem[];
};