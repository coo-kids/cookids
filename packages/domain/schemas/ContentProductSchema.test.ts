import { compile } from "@tsed/schema";
import { describe, expect, it } from "vitest";
import { ContentProductSchema } from "./ContentProductSchema.js";

describe("ContentProductSchema", () => {
  it("compile son schéma Ts.ED", () => {
    expect(compile(ContentProductSchema)).toMatchInlineSnapshot(`
      {
        "properties": {
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
      }
    `);
  });
});
