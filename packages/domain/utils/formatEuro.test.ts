import { describe, expect, it } from "vitest";
import { formatEuro } from "./formatEuro.js";

describe("formatEuro", () => {
  it("formate les centimes en euros français", () => {
    expect(formatEuro(250)).toBe("2,50 €");
  });
});
