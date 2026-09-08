import "@tsed/ajv";
import { AjvService } from "@tsed/ajv";
import { Injectable } from "@tsed/di";
import type { ContentCatalog } from "../content/ContentCatalog";
import type { SiteContent } from "../content/SiteContent";
import { ContentCatalogSchema } from "../schemas/ContentCatalogSchema";
import { SiteContentSchema } from "../schemas/SiteContentSchema";

@Injectable()
export class ContentValidationService {
  private readonly ajvService = new AjvService();

  validateCatalog(input: unknown): Promise<ContentCatalog> {
    return this.ajvService.validate<ContentCatalog>(input, { type: ContentCatalogSchema });
  }

  validateSiteContent(input: unknown): Promise<SiteContent> {
    return this.ajvService.validate<SiteContent>(input, { type: SiteContentSchema });
  }
}
