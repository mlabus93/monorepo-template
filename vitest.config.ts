import { defineConfig } from "vitest/config";
import {
  coverageExclude,
  coverageThresholds,
  mergedReportsDirectory,
  sourceCoveragePattern,
} from "./packages/vitest-config/index.ts";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: [
        `apps/*/${sourceCoveragePattern}`,
        `packages/*/${sourceCoveragePattern}`,
      ],
      exclude: coverageExclude,
      // Workspace runs enforce these per workspace. Rechecking the merged total
      // also counts source from workspaces that have no tests at all.
      thresholds: coverageThresholds,
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: mergedReportsDirectory,
    },
    projects: [
      "./apps/web/vitest.config.ts",
      "./apps/docs/vitest.config.ts",
      "./packages/ui/vitest.config.ts",
    ],
  },
});
