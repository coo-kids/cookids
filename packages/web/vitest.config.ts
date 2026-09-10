import { mergeConfig } from "vitest/config";
import { defineProject } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(viteConfig, defineProject({
  test: {
    name: "web",
    environment: "jsdom",
    include: ["src/**/*.test.ts"]
  }
}));
