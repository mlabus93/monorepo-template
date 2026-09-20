import { fileURLToPath } from "node:url";

/** @type {import("vitest/config").UserWorkspaceConfig} */
export const sharedProjectConfig = {
  test: {
    environment: "jsdom",
    restoreMocks: true,
    setupFiles: [fileURLToPath(new URL("./setup.js", import.meta.url))],
  },
};
