import { constant, Injectable } from "@tsed/di";
import { Resend } from "resend";
import { MailService } from "@cookids/domain/mail/MailService.js";
import type { Order } from "@cookids/domain/models/Order.js";

@Injectable()
export class ResendMailService extends MailService {
  async sendOrderConfirmation(order: Order): Promise<void> {
    const { apiKey, from } = this.getSettings(order);

    const rows = order.items.map((item) => `<tr><td>${item.productName}</td><td>${item.quantity}</td><td>${item.total.toFixed(2)} €</td></tr>`).join("");
    const result = await new Resend(apiKey).emails.send({
      from,
      to: [order.customer.email],
      subject: `Confirmation de votre commande #${order.id}`,
      html: `<h1>Merci pour votre commande</h1><p>Votre numéro de suivi est <strong>#${order.id}</strong>.</p><table><thead><tr><th>Produit</th><th>Quantité</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><p><strong>Total : ${order.total.toFixed(2)} €</strong></p>`
    });

    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  protected getSettings(order: Order) {
    const apiKey = constant<string>("envs.RESEND_API_KEY");
    const from = constant<string>("envs.RESEND_FROM");

    if (!apiKey || !from || !order.id) {
      throw new Error("Resend configuration or order ID is missing.");
    }
    return { apiKey, from };
  }
}
