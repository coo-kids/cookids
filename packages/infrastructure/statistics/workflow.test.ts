import { readFile } from "node:fs/promises";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";

describe("workflow cagnotte", () => {
  it("se lance uniquement manuellement sur main et ne force pas le push", async () => {
    const source = await readFile(".github/workflows/update-statistics.yml", "utf8");
    const workflow = parse(source);
    expect(Object.keys(workflow.on)).toEqual(["workflow_dispatch"]);
    expect(workflow.jobs.update.if).toBe("github.ref == 'refs/heads/main'");
    expect(workflow.jobs.update["runs-on"]).toBe("ubuntu-latest");
    expect(source).toContain("secrets.COOKIDS_STATS_TOKEN");
    expect(source).toContain("git diff --quiet -- contents/statistics.yml");
    expect(source).not.toContain("--force");
  });
});
