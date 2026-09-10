import type { DeliveryLocation } from "../schemas/DeliveryLocationsSchema.js";

export abstract class DeliveryLocationProvider {
  abstract getDeliveryLocations(): Promise<DeliveryLocation[]>;
}
