import { ContentValidationService } from "@cookids/domain/content/ContentValidationService";
import type { ContentCatalog, SiteContent } from "@cookids/domain";

const contentValidationService = new ContentValidationService();

export function validateCatalog(content: unknown): Promise<ContentCatalog> {
  return contentValidationService.validateCatalog(content);
}

export function validateSiteContent(content: unknown): Promise<SiteContent> {
  return contentValidationService.validateSiteContent(content);
}
