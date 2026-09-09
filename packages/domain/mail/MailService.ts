import type { Order } from "../models/Order.js";

export abstract class MailService {
  abstract sendOrderConfirmation(order: Order): Promise<void>;
}
