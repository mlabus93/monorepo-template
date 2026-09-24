import { fileURLToPath } from "node:url";
import type { ViteUserConfig } from "vitest/config";
import { coverageConfigDefaults } from "vitest/config";

export const sourceCoveragePattern = "src/**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}";

export const coverageExclude = [
  ...coverageConfigDefaults.exclude,
  "**/*.d.{ts,mts,cts}",
  "**/*.{test,spec}.{js,jsx,ts,tsx,mjs,cjs,mts,cts}",
  "**/{__tests__,__mocks__,test,tests}/**",
  // Entry points only mount the app into the DOM; App tests cover the rest.
  "**/src/main.{js,jsx,ts,tsx}",
];

// Every workspace must meet these on its own; the merged report reuses them.
export const coverageThresholds = {
  statements: 80,
  lines: 80,
  functions: 80,
  branches: 75,
};

// Resolved from this package so it is correct from any Vitest root.
export const mergedReportsDirectory = fileURLToPath(
  new URL("./coverage/report", import.meta.url),
);

export const sharedProjectConfig = {
  test: {
    environment: "jsdom",
    restoreMocks: true,
    setupFiles: [fileURLToPath(new URL("./setup.ts", import.meta.url))],
    coverage: {
      provider: "v8",
      // Measure only this workspace's source, including untested files.
      // Sibling packages must be covered by their own tests.
      include: [sourceCoveragePattern],
      exclude: coverageExclude,
      thresholds: coverageThresholds,
    },
  },
} satisfies ViteUserConfig;
