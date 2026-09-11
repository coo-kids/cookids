import { constant, context, Injectable } from "@tsed/di";
import nodemailer from "nodemailer";
import { MailService } from "@cookids/domain/mail/MailService.js";
import type { Order } from "@cookids/domain/models/Order.js";

@Injectable()
export class GmailMailService extends MailService {
  async sendOrderConfirmation(order: Order): Promise<void> {
    const { appPassword, user } = this.getSettings();
    const rows = order.items.map((item) => `<tr><td>${item.productName}</td><td>${item.quantity}</td><td>${item.total.toFixed(2)} €</td></tr>`).join("");

    await nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass: appPassword }
    }).sendMail({
      from: user,
      to: order.customer.email,
      subject: `Confirmation de votre commande #${order.id}`,
      html: `<h1>Merci pour votre commande</h1><p>Votre numéro de suivi est <strong>#${order.id}</strong>.</p><table><thead><tr><th>Produit</th><th>Quantité</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><p><strong>Total : ${order.total.toFixed(2)} €</strong></p>`
    });
  }

  protected getSettings() {
    const user = constant<string>("envs.GMAIL_USER");
    const appPassword = constant<string>("envs.GMAIL_APP_PASSWORD");

    if (!user || !appPassword) {
      context().logger.error({
        event: "gmail.configuration.missing",
        gmail_user_configured: Boolean(user),
        gmail_app_password_configured: Boolean(appPassword)
      });
      throw new Error("Gmail configuration is missing.");
    }

    return { user, appPassword };
  }
}
