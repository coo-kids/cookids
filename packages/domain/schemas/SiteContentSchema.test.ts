import { compile } from "@tsed/schema";
import { describe, expect, it } from "vitest";
import { SiteContentSchema } from "./SiteContentSchema.js";

describe("SiteContentSchema", () => {
  it("compile son schéma Ts.ED", () => {
    expect(compile(SiteContentSchema)).toMatchInlineSnapshot(`
      {
        "properties": {
          "brand": {
            "maxLength": 80,
            "minLength": 1,
            "type": "string",
          },
          "catalogTitle": {
            "maxLength": 160,
            "minLength": 1,
            "type": "string",
          },
          "cookiesNote": {
            "maxLength": 300,
            "minLength": 1,
            "type": "string",
          },
          "footer": {
            "maxLength": 240,
            "minLength": 1,
            "type": "string",
          },
          "heroText": {
            "maxLength": 500,
            "minLength": 1,
            "type": "string",
          },
          "heroTitle": {
            "maxLength": 240,
            "minLength": 1,
            "type": "string",
          },
          "intro": {
            "maxLength": 500,
            "minLength": 1,
            "type": "string",
          },
          "orderTitle": {
            "maxLength": 160,
            "minLength": 1,
            "type": "string",
          },
        },
        "required": [
          "brand",
          "intro",
          "heroTitle",
          "heroText",
          "catalogTitle",
          "cookiesNote",
          "orderTitle",
          "footer",
        ],
        "type": "object",
      }
    `);
  });
});
