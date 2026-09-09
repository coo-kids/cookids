import { fileURLToPath } from "node:url";
import { type SiteContent, SiteContentProvider, SiteContentSchema } from "@cookids/domain";
import { validate } from "@tsed/ajv";
import { parse } from "yaml";

declare const Bun: { file(path: string): { text(): Promise<string> } };

const sitePath = fileURLToPath(new URL("../../../contents/site.yml", import.meta.url));

export class BunSiteContentProvider extends SiteContentProvider {
  private siteContentPromise: Promise<SiteContent> | undefined;

  getSiteContent(): Promise<SiteContent> {
    this.siteContentPromise ??= this.loadSiteContent();
    return this.siteContentPromise;
  }

  private async loadSiteContent(): Promise<SiteContent> {
    return validate<SiteContent>(parse(await Bun.file(sitePath).text()), { type: SiteContentSchema });
  }
}
