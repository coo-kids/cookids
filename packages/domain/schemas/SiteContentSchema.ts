import { s } from "@tsed/schema";

export const SocialLinkSchema = s.object({
  icon: s.string().enum("whatsapp", "x", "instagram", "facebook").required(),
  title: s.string().maxLength(160).required(),
  href: s.url().pattern(/^https:\/\//).maxLength(2048).required()
});

export const ProjectSectionSchema = s.object({
  title: s.string().maxLength(160).required(),
  paragraphs: s.array(s.string().maxLength(600).required()).minItems(1).required(),
  image: s.string().maxLength(200),
  imageAlt: s.string().maxLength(160),
  closing: s.string().maxLength(240),
  signature: s.string().maxLength(80)
});

export const SiteContentSchema = s.object({
  brand: s.string().maxLength(80).required(),
  cagnotteTitle: s.string().maxLength(80).required(),
  cagnotteCounter: s.string().maxLength(160).required(),
  cagnotteText: s.string().maxLength(500).required(),
  intro: s.string().maxLength(500).required(),
  heroTitle: s.string().maxLength(240).required(),
  heroText: s.string().maxLength(500).required(),
  catalogTitle: s.string().maxLength(160).required(),
  cookiesNote: s.string().maxLength(300).required(),
  orderTitle: s.string().maxLength(160).required(),
  footer: s.string().maxLength(240).required(),
  projectLabel: s.string().maxLength(80).required(),
  projectTitle: s.string().maxLength(240).required(),
  projectSections: s.array(ProjectSectionSchema).minItems(1).required(),
  socialLinks: s.array(SocialLinkSchema).default([])
});

export type SiteContent = s.infer<typeof SiteContentSchema>;
export type SocialLink = s.infer<typeof SocialLinkSchema>;
export type ProjectSection = s.infer<typeof ProjectSectionSchema>;
