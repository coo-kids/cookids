import type { OrderCustomer } from "./OrderCustomer";
import type { OrderItem } from "./OrderItem";

export interface Order {
  id: string;
  createdAt: Date;
  customer: OrderCustomer;
  items: OrderItem[];
  totalCents: number;
  comment?: string;
  status: "new";
}
