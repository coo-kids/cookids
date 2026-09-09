import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["./api/vitest.config.ts", "./packages/*/vitest.config.ts", "./apps/*/vitest.config.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["api/**/*.ts", "packages/**/*.ts", "apps/web/src/**/*.{ts,vue}"],
      exclude: ["**/*.test.ts", "**/*.d.ts", "**/index.ts"]
    }
  }
});
