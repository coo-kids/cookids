import {
  type ContentCatalog,
  ContentCatalogSchema,
  type SiteContent,
  SiteContentSchema
} from "@cookids/domain";
import { validate } from "@tsed/ajv";

export function validateCatalog(content: unknown): Promise<ContentCatalog> {
  return validate<ContentCatalog>(content, { type: ContentCatalogSchema });
}

export function validateSiteContent(content: unknown): Promise<SiteContent> {
  return validate<SiteContent>(content, { type: SiteContentSchema });
}
