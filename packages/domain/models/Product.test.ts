import "reflect-metadata";
import { compile } from "@tsed/schema";
import { describe, expect, it } from "vitest";
import { Product } from "./Product.js";

describe("Product", () => {
  it("compile son modèle Ts.ED", () => {
    expect(compile(Product)).toMatchInlineSnapshot(`
      {
        "definitions": {
          "ProductIngredient": {
            "properties": {
              "is_allergen": {
                "type": "boolean",
              },
              "label": {
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
        },
        "properties": {
          "category": {
            "minLength": 1,
            "type": "string",
          },
          "description": {
            "minLength": 1,
            "type": "string",
          },
          "id": {
            "minLength": 1,
            "type": "string",
          },
          "image": {
            "minLength": 1,
            "type": "string",
          },
          "ingredients": {
            "items": {
              "$ref": "#/definitions/ProductIngredient",
            },
            "type": "array",
          },
          "name": {
            "minLength": 1,
            "type": "string",
          },
          "price": {
            "minimum": 1,
            "type": "number",
          },
          "unitLabel": {
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
