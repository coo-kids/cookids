import { beforeEach, describe, expect, it, vi } from "vitest";
import { injector } from "@tsed/di";
import { OrderItem } from "@cookids/domain/models/OrderItem.js";

const { createTransport, sendMail } = vi.hoisted(() => ({
  createTransport: vi.fn(),
  sendMail: vi.fn().mockResolvedValue({ messageId: "email-id" })
}));

vi.mock("nodemailer", () => ({ default: { createTransport } }));

describe("GmailMailService", () => {
  beforeEach(() => {
    createTransport.mockReset().mockReturnValue({ sendMail });
    sendMail.mockClear();
    injector().settings.set("envs", { GMAIL_USER: "hello@cookids.test", GMAIL_APP_PASSWORD: "test-app-password" });
  });

  it("envoie une confirmation avec le numéro GitHub de commande", async () => {
    const { GmailMailService } = await import("./GmailMailService.js");
    await new GmailMailService().sendOrderConfirmation({
      id: 42,
      createdAt: new Date(),
      customer: { firstName: "Camille", email: "camille@example.com" },
      deliveryLocation: "rosa-parks",
      items: [Object.assign(new OrderItem(), { productId: "cookie", productName: "Cookie", unitPrice: 12, unitLabel: "la boîte de 12", quantity: 2, toppingLabels: ["Chocolat noir", "Café"] })],
      total: 24,
      status: "new"
    });

    expect(createTransport).toHaveBeenCalledWith({ service: "gmail", auth: { user: "hello@cookids.test", pass: "test-app-password" } });
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: "hello@cookids.test",
      to: "camille@example.com",
      subject: "Confirmation de votre commande #42",
      html: expect.stringMatching(/la boîte de 12[\s\S]*Wero[\s\S]*PayPal[\s\S]*Virement bancaire/),
    }));
    expect(sendMail.mock.calls[0]?.[0].html).toContain("Chocolat noir, Café");
  });

  it("rejette une configuration Gmail incomplète", async () => {
    injector().settings.set("envs", { GMAIL_USER: "hello@cookids.test" });
    const { GmailMailService } = await import("./GmailMailService.js");

    await expect(new GmailMailService().sendOrderConfirmation({
      createdAt: new Date(),
      customer: { firstName: "Camille", email: "camille@example.com" },
      deliveryLocation: "rosa-parks",
      items: [],
      total: 0,
      status: "new"
    })).rejects.toThrow("Gmail configuration is missing.");
  });

  it("présente les commandes groupées par participant", async () => {
    const { GmailMailService } = await import("./GmailMailService.js");
    await new GmailMailService().sendOrderConfirmation({
      id: 43,
      createdAt: new Date(),
      customer: { firstName: "Camille", email: "camille@example.com" },
      deliveryLocation: "rosa-parks",
      items: [
        Object.assign(new OrderItem(), { productId: "cookie", productName: "Cookie", unitPrice: 1, unitLabel: "1 cookie", quantity: 5, participantLabel: "Camille" }),
        Object.assign(new OrderItem(), { productId: "cookie", productName: "Cookie", unitPrice: 1, unitLabel: "1 cookie", quantity: 7, participantLabel: "Bureau" }),
      ],
      total: 12,
      status: "new",
    });

    const html = sendMail.mock.calls[0]?.[0].html;
    expect(html).toContain("Camille — 5.00 €");
    expect(html).toContain("Bureau — 7.00 €");
  });
});
