import { inject, Injectable } from "@tsed/di";
import { GuestbookRepository } from "../repositories/GuestbookRepository.js";
import type { GuestbookEntry } from "../models/GuestbookEntry.js";

@Injectable()
export class GuestbookService {
  private repository = inject(GuestbookRepository);
  private cache?: { entries: GuestbookEntry[]; expiresAt: number };
  private pending?: Promise<GuestbookEntry[]>;

  async listPublished(): Promise<GuestbookEntry[]> {
    if (this.cache && Date.now() < this.cache.expiresAt) return this.cache.entries;
    if (this.pending) return this.pending;
    this.pending = this.repository.listPublished().then((entries) => {
      this.cache = { entries, expiresAt: Date.now() + 5 * 60_000 };
      return entries;
    });
    try { return await this.pending; } finally { this.pending = undefined; }
  }

  save(entry: GuestbookEntry): Promise<void> { return this.repository.save(entry); }
}
