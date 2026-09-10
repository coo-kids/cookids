import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["./packages/*/vitest.config.ts", "./api/vitest.config.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["packages/server/**/*.ts", "packages/**/*.ts", "packages/web/src/**/*.{ts,vue}"],
      exclude: ["**/*.test.ts", "**/*.d.ts", "**/index.ts"]
    }
  }
});
