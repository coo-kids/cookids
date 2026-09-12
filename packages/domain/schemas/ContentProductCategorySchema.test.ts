import { compile } from "@tsed/schema";
import { describe, expect, it } from "vitest";
import { ContentProductCategorySchema } from "./ContentProductCategorySchema.js";

describe("ContentProductCategorySchema", () => {
  it("compile son schéma Ts.ED", () => {
    expect(compile(ContentProductCategorySchema)).toMatchInlineSnapshot(`
      {
        "properties": {
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
      }
    `);
  });
});
