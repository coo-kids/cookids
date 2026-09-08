import type { Order } from "../models/Order";

export abstract class OrderRepository {
  abstract save(order: Order): Promise<void>;
}
