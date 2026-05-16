export type NotificationType = "LowStock" | "OutOfStock" | "NewBooking";

export interface StockAlertNotification {
  id: string;
  type: "LowStock" | "OutOfStock";
  productId: string;
  productName: string;
  stockQty: number;
  unit: string;
  organizationId: string;
  occurredAt: string;
  read: boolean;
}

export interface NewBookingNotification {
  id: string;
  type: "NewBooking";
  bookingId: string;
  clientName: string;
  serviceName: string;
  startAt: string;
  organizationId: string;
  occurredAt: string;
  read: boolean;
}

export type AnyNotification = StockAlertNotification | NewBookingNotification;
