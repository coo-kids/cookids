import siteSource from "../../../../contents/site.yml";
import { validateSiteContent } from "./validateContent.js";
import type { SiteContent } from "@cookids/domain/schemas/SiteContentSchema.js";

export const siteContent: SiteContent = await validateSiteContent(siteSource);
