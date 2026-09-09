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
          "deliveryLocations": {
            "items": {
              "properties": {
                "fixedDeliveryDates": {
                  "items": {
                    "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
                    "type": "string",
                  },
                  "type": "array",
                },
                "id": {
                  "minLength": 1,
                  "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                  "type": "string",
                },
                "label": {
                  "maxLength": 120,
                  "minLength": 1,
                  "type": "string",
                },
              },
              "required": [
                "id",
                "label",
                "fixedDeliveryDates",
              ],
              "type": "object",
            },
            "type": "array",
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
          "deliveryLocations",
        ],
        "type": "object",
      }
    `);
  });
});
