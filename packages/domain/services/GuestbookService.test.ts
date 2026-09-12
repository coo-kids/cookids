import "reflect-metadata";
import { DITest } from "@tsed/di";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GuestbookService } from "./GuestbookService.js";
import { GuestbookRepository } from "../repositories/GuestbookRepository.js";
afterEach(async () => { vi.restoreAllMocks(); await DITest.reset(); });
describe("GuestbookService", () => {
  it("partage les lectures concurrentes puis renouvelle le cache après cinq minutes", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1000);
    const repository = { listPublished: vi.fn().mockResolvedValue([{ author: "Alice", comment: "Merci" }]), save: vi.fn().mockResolvedValue(undefined) };
    const service = await DITest.invoke<GuestbookService>(GuestbookService, [{ token: GuestbookRepository, use: repository }]);
    await Promise.all([service.listPublished(), service.listPublished()]);
    await service.listPublished();
    expect(repository.listPublished).toHaveBeenCalledTimes(1);
    now.mockReturnValue(301000);
    await service.listPublished();
    expect(repository.listPublished).toHaveBeenCalledTimes(2);
    await service.save({ author: "Bob", comment: "Bonjour" });
    await service.listPublished();
    expect(repository.listPublished).toHaveBeenCalledTimes(2);
  });
  it("ne cache pas les erreurs", async () => {
    const repository = { listPublished: vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue([]), save: vi.fn() };
    const service = await DITest.invoke<GuestbookService>(GuestbookService, [{ token: GuestbookRepository, use: repository }]);
    await expect(service.listPublished()).rejects.toThrow("offline");
    await expect(service.listPublished()).resolves.toEqual([]);
  });
});
