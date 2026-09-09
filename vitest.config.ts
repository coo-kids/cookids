import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["./apps/server/vitest.config.ts", "./packages/*/vitest.config.ts", "./apps/*/vitest.config.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["apps/server/**/*.ts", "packages/**/*.ts", "apps/web/src/**/*.{ts,vue}"],
      exclude: ["**/*.test.ts", "**/*.d.ts", "**/index.ts"]
    }
  }
});
