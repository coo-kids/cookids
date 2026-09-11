export interface OrderResponse {
  id?: number;
  total: number;
  deliveryLocation: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitLabel: string;
    total: number;
  }>;
}
