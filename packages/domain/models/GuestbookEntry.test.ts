import { compile } from "@tsed/schema";
import { describe, expect, it } from "vitest";
import { GuestbookEntry } from "./GuestbookEntry.js";
describe("GuestbookEntry", () => {
  it("compile son schéma de validation", () => {
    expect(compile(GuestbookEntry)).toMatchInlineSnapshot(`
      {
        "properties": {
          "author": {
            "maxLength": 80,
            "minLength": 1,
            "type": "string",
          },
          "comment": {
            "maxLength": 2000,
            "minLength": 1,
            "type": "string",
          },
        },
        "required": [
          "author",
          "comment",
        ],
        "type": "object",
      }
    `);
  });
});
