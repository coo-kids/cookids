// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { router } from "./router.js";

describe("router", () => {
  it("associe les pages publiques à leurs routes", () => {
    expect(router.resolve("/").name).toBe("home");
    expect(router.resolve("/projet").name).toBe("project");
    expect(router.resolve("/cagnotte").name).toBe("cagnotte");
    expect(router.resolve("/commande").name).toBe("checkout");
  });
});
