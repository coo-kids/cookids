import type { Order } from "../models/Order";

export abstract class MailService {
  abstract sendOrderConfirmation(order: Order): Promise<void>;
}
