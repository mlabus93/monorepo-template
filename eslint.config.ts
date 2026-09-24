import { defineConfig, globalIgnores } from "eslint/config";
import createConfig from "@repo/eslint-config";

export default defineConfig(
  globalIgnores(["apps/**", "packages/**"]),
  createConfig(import.meta.dirname),
);
