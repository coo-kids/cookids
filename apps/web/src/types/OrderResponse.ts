export interface OrderResponse {
  id: string;
  totalPrice: number;
  deliveryLocation: string;
  items: Array<{
    productName: string;
    quantity: number;
    totalCents: number;
  }>;
}
