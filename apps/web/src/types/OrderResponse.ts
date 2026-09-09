export interface OrderResponse {
  id: string;
  totalCents: number;
  items: Array<{
    productName: string;
    quantity: number;
    totalCents: number;
  }>;
}
