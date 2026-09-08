import { MailService, type Order } from "@cookids/domain";

export class FakeMailService extends MailService {
  readonly sentOrders: Order[] = [];

  async sendOrderConfirmation(order: Order): Promise<void> {
    this.sentOrders.push(order);
  }
}
