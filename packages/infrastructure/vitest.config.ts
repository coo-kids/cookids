import { defineProject } from "vitest/config";

export default defineProject({
  assetsInclude: ["**/*.graphql"],
  test: {
    name: "infrastructure",
    environment: "node",
    include: ["**/*.test.ts"]
  }
});
