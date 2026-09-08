import type { SiteContent } from "@cookids/domain";
import siteSource from "../../../../contents/site.yml";
import { validateSiteContent } from "./validateContent";

export const siteContent: SiteContent = await validateSiteContent(siteSource);
