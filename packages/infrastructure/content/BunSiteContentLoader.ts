import { resolve } from "node:path";
import { Injectable } from "@tsed/di";
import { ContentValidationService, type SiteContent } from "@cookids/domain";
import { parse } from "yaml";

declare const Bun: { file(path: string): { text(): Promise<string> } };

const sitePath = resolve(import.meta.dir, "../../../contents/site.yml");

@Injectable()
export class BunSiteContentLoader {
  private readonly contentValidationService = new ContentValidationService();

  async load(): Promise<SiteContent> {
    return this.contentValidationService.validateSiteContent(parse(await Bun.file(sitePath).text()));
  }
}
