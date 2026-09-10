import { MailService } from "@cookids/domain/mail/MailService.js";
import type { Order } from "@cookids/domain/models/Order.js";

export class FakeMailService extends MailService {
  readonly sentOrders: Order[] = [];

  async sendOrderConfirmation(order: Order): Promise<void> {
    this.sentOrders.push(order);
  }
}
