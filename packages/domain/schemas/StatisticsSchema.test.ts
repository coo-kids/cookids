import { compile } from "@tsed/schema";
import { validate } from "@tsed/ajv";
import { describe, expect, it } from "vitest";
import { StatisticsSchema } from "./StatisticsSchema.js";

describe("StatisticsSchema", () => {
  it("compile son schéma Ts.ED", () => {
    expect(compile(StatisticsSchema)).toMatchInlineSnapshot(`
      {
        "properties": {
          "totalCookiesSold": {
            "minimum": 0,
            "multipleOf": 1,
            "type": "integer",
          },
        },
        "required": [
          "totalCookiesSold",
        ],
        "type": "object",
      }
    `);
  });
  it.each([0, 1248])("accepte le total %s", async (totalCookiesSold) => {
    await expect(validate({ totalCookiesSold }, { type: StatisticsSchema })).resolves.toMatchObject({ totalCookiesSold });
  });
  it.each([-1, 1.5])("refuse le total %s", async (totalCookiesSold) => {
    await expect(validate({ totalCookiesSold }, { type: StatisticsSchema })).rejects.toThrow();
  });
});
