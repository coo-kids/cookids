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
          "ProductTopping": {
            "properties": {
              "id": {
                "minLength": 1,
                "type": "string",
              },
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
              "id",
            ],
            "type": "object",
          },
        },
        "properties": {
          "availableToppings": {
            "items": {
              "$ref": "#/definitions/ProductTopping",
            },
            "type": "array",
          },
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
            "minLength": 1,
            "type": "string",
          },
          "price": {
            "minimum": 1,
            "type": "number",
          },
          "quantityMultiple": {
            "minimum": 1,
            "multipleOf": 1,
            "type": "integer",
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
