import httpClient from '../httpClient';
import { ICreateOrderRequest, IOrder } from './order.model';

/**
 * Map backend OrderState enum values to client status values
 * Backend uses Prisma enums: REVIEW, PENDING, PAID, SENT, CANCELLED
 * Frontend expects: 'review', 'approved', 'paid', 'delivering', 'cancelled'
 */
const mapOrderStatus = (
  backendStatus: string | undefined,
): IOrder['status'] => {
  if (!backendStatus) {
    return 'review';
  }

  // Normalize to uppercase for case-insensitive comparison
  const normalized = backendStatus.toUpperCase().trim();

  switch (normalized) {
    case 'REVIEW':
      // Self items being reviewed by admin
      return 'review';
    case 'PENDING':
      // Factory items ready for payment (shows "Buyurtma qilish" button)
      return 'approved';
    case 'PAID':
      // Payment completed, waiting for processing
      return 'paid';
    case 'SENT':
      // Order shipped/sent to customer (shows "Buyurtmani kuzatish" button)
      return 'delivering';
    case 'CANCELLED':
      // Order cancelled
      return 'cancelled';
    default:
      return 'review';
  }
};

/**
 * Transform order data from backend to client format
 * Backend returns 'state' field (Prisma enum), frontend expects 'status'
 */
const transformOrder = (order: any): IOrder => {
  // Backend uses 'state' field, but we map to 'status' for frontend
  // Handle both 'state' and 'status' fields for backward compatibility
  const backendState = order.state || order.status;
  const clientStatus = mapOrderStatus(backendState);

  return {
    ...order,
    status: clientStatus,
  };
};

/**
 * Transform array of orders
 */
const transformOrders = (orders: any[]): IOrder[] => {
  return orders.map(transformOrder);
};

export const orderRequest = {
  create: async (data: ICreateOrderRequest) => {
    const response = await httpClient.post<{ order: any; ok: boolean }>(
      '/order',
      data,
    );

    // Handle both single order and array of orders (for multiple factory orders)
    if (Array.isArray(response.data.order)) {
      const transformed = transformOrders(response.data.order);
      return {
        ...response.data,
        data: transformed,
      };
    } else {
      const transformed = transformOrder(response.data.order);
      return {
        ...response.data,
        data: transformed,
      };
    }
  },
  getAll: async () => {
    const response = await httpClient.get<{ data: any[]; ok: boolean }>(
      '/order',
    );
    const orders = response.data.data || [];
    const transformed = transformOrders(orders);
    return {
      ...response.data,
      data: transformed,
    };
  },
  getPaymeLink: async (orderId: number, amount: number) => {
    const response = await httpClient.post<{ link: string; ok: boolean }>(
      '/payment/payme/generate-link',
      { orderId, amount },
    );
    return response.data;
  },
};
