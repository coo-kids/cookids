import "@tsed/ajv";
import { AjvService } from "@tsed/ajv";
import { Injectable } from "@tsed/di";
import { ContentCatalogSchema, type ContentCatalog } from "../schemas/ContentCatalogSchema.js";
import { SiteContentSchema, type SiteContent } from "../schemas/SiteContentSchema.js";

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
