import { validate } from "@tsed/ajv";
import {
  type ContentCatalog,
  ContentCatalogSchema
} from "@cookids/domain/schemas/ContentCatalogSchema.js";
import { type SiteContent, SiteContentSchema } from "@cookids/domain/schemas/SiteContentSchema.js";

export function validateCatalog(content: unknown): Promise<ContentCatalog> {
  return validate<ContentCatalog>(content, { type: ContentCatalogSchema });
}

export function validateSiteContent(content: unknown): Promise<SiteContent> {
  return validate<SiteContent>(content, { type: SiteContentSchema });
}
