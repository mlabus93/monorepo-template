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

export const sharedProjectConfig = {
  test: {
    environment: "jsdom",
    restoreMocks: true,
    setupFiles: [fileURLToPath(new URL("./setup.ts", import.meta.url))],
    coverage: {
      provider: "v8",
      // Discover untested source within this workspace and retain imported
      // sibling source. Each package contributes its own untested files.
      include: [`**/${sourceCoveragePattern}`],
      allowExternal: true,
      exclude: coverageExclude,
    },
  },
} satisfies ViteUserConfig;
