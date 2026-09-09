import type { SiteContent } from "../schemas/SiteContentSchema.js";

export abstract class SiteContentProvider {
  abstract getSiteContent(): Promise<SiteContent>;
}
