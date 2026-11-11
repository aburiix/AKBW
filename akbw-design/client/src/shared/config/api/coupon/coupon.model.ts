import { IOrder } from '../order/order.model';

export interface Coupon {
  id: number;
  code: string;
  discount: number;
  expiry: string;
  createdAt: string;
  updatedAt: string;
  orders: IOrder[];
}

export interface IApplyCounponResponse {
  success: boolean;
  coupon: Coupon;
}
