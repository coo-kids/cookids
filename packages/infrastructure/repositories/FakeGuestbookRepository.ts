import { GuestbookRepository } from "@cookids/domain/repositories/GuestbookRepository.js";
import type { GuestbookEntry } from "@cookids/domain/models/GuestbookEntry.js";

export class FakeGuestbookRepository extends GuestbookRepository {
  async listPublished(): Promise<GuestbookEntry[]> { return []; }
  async save(_entry: GuestbookEntry): Promise<void> {}
}
