import { IFactory } from "../factory/factory.model";

export interface ITranslation {
  id: number;
  name: string;
  lang: string;
  description: string;
}

export interface IOrderItem {
  id: number;
  price: number;
  quantity: number;
  actual_product_link?: string;
  product: {
    id: number;
    product_images: string[];
    actual_product_link?: string;
    translations: ITranslation[];
  };
  size?: {
    translations: ITranslation[];
  };
  color?: {
    translations: ITranslation[];
  };
  state: "REVIEW" | "PENDING" | "SENT";
};

export interface IOrder {
  id: number;
  user_id: string;
  items: any[];
  orderItems: IOrderItem[];
  total_price: number;
  state: "PENDING" | "PAID" | "CALCELLED";
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    lastName: string;
    phone: string;
  };
  coupon?: {
    id: number;
    code: string;
    discount: number;
  };
}

export type IFulFillmentType = "SELF" | "FACTORY";

export enum ShipmentState {
  PENDING,
  ORDERED_FROM_SUPPLIER,
  SUPPLIER_CONFIRMED,
  IN_TRANSIT,
  ARRIVED_UZBEKISTAN,
  IN_CUSTOMS,
  READY_FOR_BTS,
  SENT,
  DELIVERED,
  CANCELLED,
}

export interface IShipmnet {
  id: number;
  orderId: number;
  order?: IOrder;
  type: IFulFillmentType;
  factoryId?: number | null;
  factory?: IFactory | null;
  sender_city_code: string;
  sender_region_code: string;
  sender_branch_code: string;
  receiver_city_code: string;
  receiver_branch_code: string;
  receiver_region_code: string;
  receiver_address: string;
  tracking_number?: string | null;
  state: ShipmentState;
  orderItems: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}