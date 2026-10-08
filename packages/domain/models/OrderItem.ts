import { OnDeserialize } from "@tsed/json-mapper";
import { CollectionOf, Groups, Integer, MaxLength, Maximum, Minimum, MinLength, Property, Required } from "@tsed/schema";
import type { Product } from "@cookids/domain/models/Product.js";

export class OrderItem {
  @Property()
  @Required()
  productId!: string;

  @Property()
  @Required()
  @Groups("!create")
  productName!: string;

  @Property()
  @Required()
  @Minimum(0)
  @Groups("!create")
  unitPrice!: number;

  @Property()
  @Required()
  @Groups("!create")
  unitLabel!: string;

  @Property()
  @Required()
  @Integer()
  @Minimum(1)
  @Maximum(480)
  quantity!: number;

  @Property()
  @CollectionOf(String)
  toppingIds?: string[];

  @Property()
  @CollectionOf(String)
  @Groups("!create")
  toppingLabels?: string[];

  @Property()
  @MinLength(1)
  @MaxLength(80)
  @OnDeserialize((value?: string) => value?.trim())
  participantLabel?: string;

  @Property()
  @Required()
  @Minimum(0)
  @Groups("!create")
  get total(): number {
    return this.quantity * this.unitPrice;
  }

  setProduct(product: Product) {
    this.productName = product.name;
    this.unitPrice = product.price;
    this.unitLabel = product.unitLabel;
    this.toppingLabels = this.toppingIds?.map((id) => product.availableToppings?.find((topping) => topping.id === id)?.label).filter((label): label is string => Boolean(label));
    return this;
  }
}
