import type { Order } from "../models/Order.js";

export abstract class OrderRepository {
  abstract save(order: Order): Promise<{ id: number }>;
}
