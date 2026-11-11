export enum PaymentDateForFactories {
  MONTH = 'MONTH',
  THREEMONTH = 'THREEMONTH',
  SIXMONTH = 'SIXMONTH',
  YEAR = 'YEAR',
}

export interface IFactory {
  id: number;
  name: string;
  phone: string;
  adress: string;
  bts_code: string;
  payment_type: PaymentDateForFactories;
  login: string;
  bank_name?: string;
  bank_account?: string;
  bank_mfo?: string;
  bank_inn?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateFactory {
  name: string;
  phone: string;
  adress: string;
  bts_code: string;
  login: string;
  password?: string;
  bank_name?: string;
  bank_account?: string;
  bank_mfo?: string;
  bank_inn?: string;
  payment_type?: PaymentDateForFactories;
}

export interface IFactoryListResponse {
  ok: boolean;
  data: IFactory[];
}