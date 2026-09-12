import { MaxLength, Property, Required } from "@tsed/schema";

export class GuestbookEntry {
  @Property()
  @Required()
  @MaxLength(80)
  author!: string;

  @Property()
  @Required()
  @MaxLength(2000)
  comment!: string;
}
