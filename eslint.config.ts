import createConfig from "@repo/eslint-config";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig(
  globalIgnores(["apps/**", "packages/**"]),
  createConfig(import.meta.dirname),
);
