import { Groups, Integer, Maximum, Minimum, Property, Required } from "@tsed/schema";
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
  @Maximum(48)
  quantity!: number;

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
    return this;
  }
}
