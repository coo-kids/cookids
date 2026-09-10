import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { validate } from "@tsed/ajv";
import { parse } from "yaml";
import { DeliveryLocationProvider } from "@cookids/domain/content/DeliveryLocationProvider.js";
import {
  type DeliveryLocations,
  DeliveryLocationsSchema
} from "@cookids/domain/schemas/DeliveryLocationsSchema.js";

const locationsPath = resolve(process.cwd(), "contents/locations.yml");

export class NodeDeliveryLocationProvider extends DeliveryLocationProvider {
  private deliveryLocationsPromise: Promise<DeliveryLocations> | undefined;

  async getDeliveryLocations(): Promise<DeliveryLocations["locations"]> {
    const content = await (this.deliveryLocationsPromise ??= this.loadDeliveryLocations());
    return content.locations;
  }

  private async loadDeliveryLocations(): Promise<DeliveryLocations> {
    return validate<DeliveryLocations>(parse(await readFile(locationsPath, "utf8")), {
      type: DeliveryLocationsSchema
    });
  }
}
