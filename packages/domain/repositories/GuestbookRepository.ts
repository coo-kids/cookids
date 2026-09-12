import type { GuestbookEntry } from "../models/GuestbookEntry.js";

export abstract class GuestbookRepository {
  abstract listPublished(): Promise<GuestbookEntry[]>;
  abstract save(entry: GuestbookEntry): Promise<void>;
}
