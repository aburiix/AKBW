import { IShipmnet } from "../order/order.model";
import { IProduct } from "../product/product.model";

export enum PaymentDateForFactories {
  MONTH = 'MONTH',
  THREEMONTH = 'THREEMONTH',
  SIXMONTH = 'SIXMONTH',
  YEAR = 'YEAR',
}

export interface IWorker {
  id: number;
  factory: number;
  factory_id: number;
  name: string;
  phone: string;
  role: string;
  tg_id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFactory {
  id: number;
  name: string;
  products: IProduct[];
  createdAt: Date;
  updatedAt: Date;
  payment_type: PaymentDateForFactories;
  phone: string;
  address: string;
  workers: IWorker[];
  bts_region_code: string;
  bts_city_code: string;
  bts_branch_code: string;
  login: string;
  password: string;
  bank_name?: string;
  bank_account?: string;
  bank_mfo?: string;
  bank_inn?: string;
  shipments: IShipmnet[];
}

export interface ICreateFactory {
  name: string;
  phone: string;
  address: string;
  bts_region_code: string;
  bts_city_code: string;
  bts_branch_code: string;
  login: string;
  password: string;
  payment_type: PaymentDateForFactories;
}

export interface IFactoryListResponse {
  ok: boolean;
  data: IFactory[];
}