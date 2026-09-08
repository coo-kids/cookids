import { CollectionOf, MinItems, Property, Required } from "@tsed/schema";
import { ContentProductSchema } from "./ContentProductSchema";

export class ContentCatalogSchema {
  @Property()
  @Required()
  @CollectionOf(ContentProductSchema)
  @MinItems(1) products!: ContentProductSchema[];
}
