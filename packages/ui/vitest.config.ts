import { sharedProjectConfig } from "@repo/vitest-config";
import { defineProject } from "vitest/config";

export default defineProject({
  ...sharedProjectConfig,
  test: {
    ...sharedProjectConfig.test,
    name: "ui",
  },
});
