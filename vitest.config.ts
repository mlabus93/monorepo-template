import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage/projects",
    },
    projects: [
      "./apps/web/vitest.config.ts",
      "./apps/docs/vitest.config.ts",
      "./packages/ui/vitest.config.ts",
    ],
  },
});
