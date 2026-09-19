const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const eslintConfigPrettier = require("eslint-config-prettier");
const globals = require("globals");
// TypeScript 7 has no compiler API yet, so this package aliases `typescript`
// to `@typescript/typescript6` for typescript-eslint. Editors and builds use TS 7.
const tseslint = require("typescript-eslint");

module.exports = defineConfig(
  {
    ignores: ["dist/**"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
);
