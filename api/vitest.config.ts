import { defineProject } from "vitest/config";

export default defineProject({
  assetsInclude: ["**/*.graphql"],
  test: {
    name: "api",
    environment: "node",
    include: ["**/*.test.ts"]
  }
});
