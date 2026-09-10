import locationsSource from "../../../../contents/locations.yml";
import { validateDeliveryLocations } from "./validateContent.js";
import type { DeliveryLocations } from "@cookids/domain/schemas/DeliveryLocationsSchema.js";

const deliveryLocations: DeliveryLocations = await validateDeliveryLocations(locationsSource);

export const locations = deliveryLocations.locations;
