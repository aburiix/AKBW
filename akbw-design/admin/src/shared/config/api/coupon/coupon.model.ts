export interface ICoupon {
  id: number;
  code: string;
  discount: number;
  expiry: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateCoupon {
  code: string;
  discount: number;
  expiry: string | Date;
}

export interface IUpdateCoupon extends ICreateCoupon {
  id: number;
}
