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
      items: [Object.assign(new OrderItem(), { productId: "cookie", productName: "Cookie", unitPrice: 3.5, quantity: 2 })],
      total: 7,
      status: "new"
    });

    expect(createTransport).toHaveBeenCalledWith({ service: "gmail", auth: { user: "hello@cookids.test", pass: "test-app-password" } });
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ from: "hello@cookids.test", to: "camille@example.com", subject: "Confirmation de votre commande #42", html: expect.stringContaining("#42") }));
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
});
