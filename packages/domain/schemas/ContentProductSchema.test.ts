import { compile } from "@tsed/schema";
import { validate } from "@tsed/ajv";
import { describe, expect, it } from "vitest";
import { ContentProductSchema } from "./ContentProductSchema.js";

describe("ContentProductSchema", () => {
  const product = {
    id: "cookie", name: "Cookie", description: "Un cookie",
    ingredients: [], price: 1, image: "/cookie.jpg",
    category: "cookies", unitLabel: "1 unité",
  };

  it.each([true, false])("accepte is_limited_edition=%s", async (is_limited_edition) => {
    await expect(validate({ ...product, is_limited_edition }, { type: ContentProductSchema })).resolves.toMatchObject({ is_limited_edition });
  });

  it("accepte un produit sans le champ optionnel", async () => {
    await expect(validate(product, { type: ContentProductSchema })).resolves.toMatchObject(product);
  });

  it("refuse une valeur non booléenne", async () => {
    await expect(validate({ ...product, is_limited_edition: {} }, { type: ContentProductSchema })).rejects.toThrow();
  });

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
          "is_limited_edition": {
            "type": "boolean",
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
