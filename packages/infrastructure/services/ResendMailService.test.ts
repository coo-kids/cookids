import { beforeEach, describe, expect, it, vi } from "vitest";
import { injector } from "@tsed/di";

const send = vi.fn().mockResolvedValue({ data: { id: "email-id" }, error: null });

vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));

describe("ResendMailService", () => {
  beforeEach(() => {
    send.mockClear();
    injector().settings.set("envs", { RESEND_API_KEY: "test-key", RESEND_FROM: "Cookids <hello@cookids.test>" });
  });

  it("envoie une confirmation avec le numéro GitHub de commande", async () => {
    const { ResendMailService } = await import("./ResendMailService.js");
    await new ResendMailService().sendOrderConfirmation({
      id: 42,
      createdAt: new Date(),
      customer: { firstName: "Camille", email: "camille@example.com" },
      deliveryLocation: "rosa-parks",
      items: [{ productId: "cookie", productName: "Cookie", unitPrice: 3.5, quantity: 2, total: 7 }],
      total: 7,
      status: "new"
    });

    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: ["camille@example.com"], subject: "Confirmation de votre commande #42", html: expect.stringContaining("#42") }));
  });
});
