import { defineConfig } from "vitest/config";
import {
  coverageExclude,
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
      // Aggregate baseline, verified against the merged workspace blobs.
      thresholds: {
        statements: 80,
        lines: 80,
        functions: 80,
        branches: 75,
      },
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "packages/vitest-config/coverage/report",
    },
    projects: [
      "./apps/web/vitest.config.ts",
      "./apps/docs/vitest.config.ts",
      "./packages/ui/vitest.config.ts",
    ],
  },
});
