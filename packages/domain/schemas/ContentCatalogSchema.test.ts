import { compile } from "@tsed/schema";
import { describe, expect, it } from "vitest";
import { ContentCatalogSchema } from "./ContentCatalogSchema.js";

describe("ContentCatalogSchema", () => {
  it("compile son schéma Ts.ED", () => {
    expect(compile(ContentCatalogSchema)).toMatchInlineSnapshot(`
      {
        "properties": {
          "categories": {
            "items": {
              "properties": {
                "countsAsCookies": {
                  "type": "boolean",
                },
                "id": {
                  "maxLength": 80,
                  "minLength": 1,
                  "type": "string",
                },
                "label": {
                  "maxLength": 120,
                  "minLength": 1,
                  "type": "string",
                },
                "quantityMultiple": {
                  "minimum": 1,
                  "multipleOf": 1,
                  "type": "integer",
                },
              },
              "type": "object",
            },
            "minItems": 1,
            "type": "array",
          },
          "products": {
            "items": {
              "properties": {
                "availableToppings": {
                  "items": {
                    "properties": {
                      "id": {
                        "maxLength": 80,
                        "minLength": 1,
                        "type": "string",
                      },
                      "is_allergen": {
                        "type": "boolean",
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
                      "is_allergen",
                    ],
                    "type": "object",
                  },
                  "minItems": 1,
                  "type": "array",
                },
                "category": {
                  "maxLength": 80,
                  "minLength": 1,
                  "type": "string",
                },
                "description": {
                  "maxLength": 240,
                  "minLength": 1,
                  "type": "string",
                },
                "id": {
                  "maxLength": 80,
                  "minLength": 1,
                  "type": "string",
                },
                "image": {
                  "maxLength": 200,
                  "minLength": 1,
                  "type": "string",
                },
                "ingredients": {
                  "items": {
                    "properties": {
                      "is_allergen": {
                        "type": "boolean",
                      },
                      "label": {
                        "maxLength": 120,
                        "minLength": 1,
                        "type": "string",
                      },
                    },
                    "required": [
                      "label",
                      "is_allergen",
                    ],
                    "type": "object",
                  },
                  "type": "array",
                },
                "is_limited_edition": {
                  "type": "boolean",
                },
                "maximumToppings": {
                  "minimum": 1,
                  "multipleOf": 1,
                  "type": "integer",
                },
                "minimumQuantity": {
                  "minimum": 1,
                  "multipleOf": 1,
                  "type": "integer",
                },
                "minimumToppings": {
                  "minimum": 1,
                  "multipleOf": 1,
                  "type": "integer",
                },
                "name": {
                  "maxLength": 120,
                  "minLength": 1,
                  "type": "string",
                },
                "price": {
                  "minimum": 0.01,
                  "multipleOf": 0.01,
                  "type": "number",
                },
                "quantityMultiple": {
                  "minimum": 1,
                  "multipleOf": 1,
                  "type": "integer",
                },
                "unitLabel": {
                  "maxLength": 60,
                  "minLength": 1,
                  "type": "string",
                },
              },
              "required": [
                "id",
                "name",
                "description",
                "ingredients",
                "price",
                "image",
                "category",
                "unitLabel",
              ],
              "type": "object",
            },
            "minItems": 1,
            "type": "array",
          },
        },
        "required": [
          "categories",
          "products",
        ],
        "type": "object",
      }
    `);
  });
});
