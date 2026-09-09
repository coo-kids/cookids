import { fileURLToPath } from "node:url";
import { Injectable } from "@tsed/di";
import { ContentValidationService, type SiteContent } from "@cookids/domain";
import { parse } from "yaml";

declare const Bun: { file(path: string): { text(): Promise<string> } };

const sitePath = fileURLToPath(new URL("../../../contents/site.yml", import.meta.url));

@Injectable()
export class BunSiteContentLoader {
  private readonly contentValidationService = new ContentValidationService();

  async load(): Promise<SiteContent> {
    return this.contentValidationService.validateSiteContent(parse(await Bun.file(sitePath).text()));
  }
}
