import { IBtsBranch } from '../bts/bts.model';

/**
 * Order interface with status mapping from backend to frontend
 * Backend OrderState enum values are mapped to these client statuses:
 * - REVIEW → 'review' (Self items being reviewed by admin)
 * - PENDING → 'approved' (Factory items ready for payment - shows "Buyurtma qilish" button)
 * - PAID → 'paid' (Payment completed, waiting for processing)
 * - SENT → 'delivering' (Order shipped/sent to customer - shows "Buyurtmani kuzatish" button)
 * - CANCELLED → 'cancelled' (Order cancelled)
 */
export interface IOrder {
  id: number;
  user_id: string;
  orderItems: IOrderItem[];
  total_price: number;
  status:
    | 'review' // Backend: REVIEW - Self items under review
    | 'approved' // Backend: PENDING - Factory items ready for payment
    | 'paid' // Backend: PAID - Payment completed
    | 'delivering' // Backend: SENT - Order shipped to customer
    | 'completed' // Note: Not currently used in backend, kept for compatibility
    | 'cancelled'; // Backend: CANCELLED - Order cancelled
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    lastName: string;
    phone: string;
  };
  shipments?: IShipment[];
}

export interface IShipment {
  id: number;
  state: 'PENDING' | 'READY_FOR_BTS' | 'SENT' | 'DELIVERED' | string;
  type: 'FACTORY' | 'SELF';
  factory?: {
    name: string;
  };
}

export interface IOrderItem {
  id: number;
  productId: number;
  sizeId?: number;
  colorId?: number;
  quantity: number;
  price: number;
  product?: any;
  size?: any;
  color?: any;
}

export interface ICreateOrderRequest {
  items: {
    productId: number;
    sizeId?: number | null;
    colorId?: number | null;
    quantity: number;
  }[];
  total_price: number;
  coupon_id?: number;
  coupon_code?: string;
  selectedBranch: IBtsBranch;
}
