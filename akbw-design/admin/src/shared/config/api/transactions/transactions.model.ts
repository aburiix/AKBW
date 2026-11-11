export interface ITransaction {
  id: number;
  payment_provider_id: string;
  order_id: number;
  user_id: string;
  create_time: string;
  perform_time: number;
  cancel_time: number;
  transaction: string;
  state: TransactionState;
  reason: string;
  amount: number;
  provider: string;
  prapere_id?: number;
  user: {
    name: string;
    lastName: string;
    phone: string;
  };
  order: any; // Can be refined if needed
}

export enum TransactionState {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  PENDING_CANCELLED = 'PENDING_CANCELLED',
  PAID_CANCELLED = 'PAID_CANCELLED',
}
