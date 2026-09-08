import { MaxLength, Property, Required } from "@tsed/schema";

export class SiteContentSchema {
  @Property()
  @Required()
  @MaxLength(80)
  brand!: string;

  @Property()
  @Required()
  @MaxLength(500)
  intro!: string;

  @Property()
  @Required()
  @MaxLength(240)
  heroTitle!: string;

  @Property()
  @Required()
  @MaxLength(500)
  heroText!: string;

  @Property()
  @Required()
  @MaxLength(160)
  catalogTitle!: string;

  @Property()
  @Required()
  @MaxLength(300)
  cookiesNote!: string;

  @Property()
  @Required()
  @MaxLength(160)
  orderTitle!: string;

  @Property()
  @Required()
  @MaxLength(240)
  footer!: string;
}
