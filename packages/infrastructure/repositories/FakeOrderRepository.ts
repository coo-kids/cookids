import type { Order } from "@cookids/domain/models/Order.js";
import { OrderRepository } from "@cookids/domain/repositories/OrderRepository.js";

export class FakeOrderRepository extends OrderRepository {
  readonly savedOrders: Order[] = [];

  async save(order: Order): Promise<{ id: number }> {
    this.savedOrders.push(order);
    return { id: 1 };
  }
}
