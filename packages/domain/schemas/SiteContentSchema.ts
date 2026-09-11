import { s } from "@tsed/schema";

export const SocialLinkSchema = s.object({
  icon: s.string().enum("Instagram", "MessageCircle", "Facebook", "Youtube", "Mail", "Phone", "Send").required(),
  title: s.string().maxLength(160).required(),
  href: s.url().pattern(/^https:\/\//).maxLength(2048).required()
});

export const SiteContentSchema = s.object({
  brand: s.string().maxLength(80).required(),
  intro: s.string().maxLength(500).required(),
  heroTitle: s.string().maxLength(240).required(),
  heroText: s.string().maxLength(500).required(),
  catalogTitle: s.string().maxLength(160).required(),
  cookiesNote: s.string().maxLength(300).required(),
  orderTitle: s.string().maxLength(160).required(),
  footer: s.string().maxLength(240).required(),
  socialLinks: s.array(SocialLinkSchema).default([])
});

export type SiteContent = s.infer<typeof SiteContentSchema>;
export type SocialLink = s.infer<typeof SocialLinkSchema>;
