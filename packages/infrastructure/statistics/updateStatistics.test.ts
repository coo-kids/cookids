import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  readFile: vi.fn(), writeFile: vi.fn(), count: vi.fn(), load: vi.fn(),
}));
vi.mock("node:fs/promises", () => ({ readFile: mocks.readFile, writeFile: mocks.writeFile }));
vi.mock("./countSoldCookies.js", () => ({ countSoldCookies: mocks.count }));
vi.mock("../config/loadGitHubBoards.js", () => ({ loadGitHubBoards: mocks.load }));
vi.mock("octokit", () => ({ Octokit: class {} }));

describe("updateStatistics", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("COOKIDS_STATS_TOKEN", "test-token");
    mocks.load.mockResolvedValue({});
    mocks.readFile.mockResolvedValue("totalCookiesSold: 12\n");
    mocks.count.mockResolvedValue(24);
    vi.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

  it("remplace le total au lieu d'incrémenter l'ancienne valeur", async () => {
    await import("./updateStatistics.js");
    expect(mocks.writeFile).toHaveBeenCalledWith("contents/statistics.yml", "totalCookiesSold: 24\n", "utf8");
  });
  it("ne réécrit pas le fichier si le total est inchangé", async () => {
    mocks.count.mockResolvedValue(12);
    await import("./updateStatistics.js");
    expect(mocks.writeFile).not.toHaveBeenCalled();
  });
  it("préserve le compteur si le comptage échoue", async () => {
    mocks.count.mockRejectedValue(new Error("API indisponible"));
    await expect(import("./updateStatistics.js")).rejects.toThrow("API indisponible");
    expect(mocks.writeFile).not.toHaveBeenCalled();
  });
  it("refuse de démarrer sans token", async () => {
    vi.stubEnv("COOKIDS_STATS_TOKEN", "");
    await expect(import("./updateStatistics.js")).rejects.toThrow("COOKIDS_STATS_TOKEN");
    expect(mocks.count).not.toHaveBeenCalled();
    expect(mocks.writeFile).not.toHaveBeenCalled();
  });
});
