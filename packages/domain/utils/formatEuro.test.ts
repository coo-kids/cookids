import { describe, expect, it } from "vitest";
import { formatEuro } from "./formatEuro.js";

describe("formatEuro", () => {
  it("formate les euros français", () => {
    expect(formatEuro(2.5)).toBe("2,50 €");
  });
});
