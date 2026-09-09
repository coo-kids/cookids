import "reflect-metadata";
import { compile } from "@tsed/schema";
import { describe, expect, it } from "vitest";
import { Product } from "./Product.js";

describe("Product", () => {
  it("compile son modèle Ts.ED", () => {
    expect(compile(Product)).toMatchInlineSnapshot(`
      {
        "properties": {
          "category": {
            "enum": [
              "cookies",
              "other",
            ],
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
            "minLength": 1,
            "type": "string",
          },
          "name": {
            "minLength": 1,
            "type": "string",
          },
          "priceCents": {
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
          "priceCents",
          "image",
          "category",
          "unitLabel",
        ],
        "type": "object",
      }
    `);
  });
});
