import { readFile } from "node:fs/promises";
import { parse } from "yaml";
import { validate } from "@tsed/ajv";
import { GuestbookSchema, type GuestbookSettings } from "./GuestbookSchema.js";

export async function loadGuestbook(): Promise<GuestbookSettings> {
  return validate(parse(await readFile("contents/guestbook.yml", "utf8")), { type: GuestbookSchema });
}
