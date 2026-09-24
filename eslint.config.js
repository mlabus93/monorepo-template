import { defineConfig, globalIgnores } from "eslint/config";
import config from "@repo/eslint-config";

export default defineConfig(globalIgnores(["apps/**", "packages/**"]), config);
