import { type Order, OrderRepository } from "@cookids/domain";

export class FakeOrderRepository extends OrderRepository {
  readonly savedOrders: Order[] = [];

  async save(order: Order): Promise<void> {
    this.savedOrders.push(order);
  }
}
