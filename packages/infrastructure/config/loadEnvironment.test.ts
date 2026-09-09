import { beforeEach, describe, expect, it, vi } from "vitest";

const { config } = vi.hoisted(() => ({ config: vi.fn() }));

vi.mock("dotenv-flow", () => ({ default: { config } }));

import { loadEnvironment } from "./loadEnvironment.js";

describe("loadEnvironment", () => {
  beforeEach(() => config.mockClear());

  it("charge dotenv-flow silencieusement et retourne l'environnement courant", () => {
    expect(loadEnvironment()).toBe(process.env);
    expect(config).toHaveBeenCalledWith({ silent: true });
  });
});
