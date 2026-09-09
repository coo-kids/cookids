import { s } from "@tsed/schema";

export const SiteContentSchema = s.object({
  brand: s.string().maxLength(80).required(),
  intro: s.string().maxLength(500).required(),
  heroTitle: s.string().maxLength(240).required(),
  heroText: s.string().maxLength(500).required(),
  catalogTitle: s.string().maxLength(160).required(),
  cookiesNote: s.string().maxLength(300).required(),
  orderTitle: s.string().maxLength(160).required(),
  footer: s.string().maxLength(240).required(),
  deliveryLocations: s.array(s.object({
    id: s.string().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).required(),
    label: s.string().maxLength(120).required(),
    fixedDeliveryDates: s.array(s.string().pattern(/^\d{4}-\d{2}-\d{2}$/)).required()
  })).required()
});

export type SiteContent = s.infer<typeof SiteContentSchema>;
