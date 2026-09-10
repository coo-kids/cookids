import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { validate } from "@tsed/ajv";
import { parse } from "yaml";
import { SiteContentProvider } from "@cookids/domain/content/SiteContentProvider.js";
import { type SiteContent, SiteContentSchema } from "@cookids/domain/schemas/SiteContentSchema.js";

const sitePath = resolve(process.cwd(), "contents/site.yml");

export class NodeSiteContentProvider extends SiteContentProvider {
  private siteContentPromise: Promise<SiteContent> | undefined;

  getSiteContent(): Promise<SiteContent> {
    this.siteContentPromise ??= this.loadSiteContent();
    return this.siteContentPromise;
  }

  private async loadSiteContent(): Promise<SiteContent> {
    return validate<SiteContent>(parse(await readFile(sitePath, "utf8")), { type: SiteContentSchema });
  }
}
