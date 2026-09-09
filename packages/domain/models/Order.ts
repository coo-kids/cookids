import type { OrderCustomer } from "./OrderCustomer.js";
import type { OrderItem } from "./OrderItem.js";

export interface Order {
  id: string;
  createdAt: Date;
  customer: OrderCustomer;
  items: OrderItem[];
  totalCents: number;
  comment?: string;
  status: "new";
}
