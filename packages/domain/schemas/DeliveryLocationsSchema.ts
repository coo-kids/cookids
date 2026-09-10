import { s } from "@tsed/schema";

export const DeliveryLocationSchema = s.object({
  id: s.string().maxLength(120).required(),
  label: s.string().maxLength(120).required(),
  fixedDeliveryDates: s.array(s.string().pattern(/^\d{4}-\d{2}-\d{2}$/)).required()
});

export const DeliveryLocationsSchema = s.object({
  locations: s.array(DeliveryLocationSchema).minItems(1).required()
});

export type DeliveryLocation = s.infer<typeof DeliveryLocationSchema>;
export type DeliveryLocations = s.infer<typeof DeliveryLocationsSchema>;
