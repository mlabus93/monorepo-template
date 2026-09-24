import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
// TypeScript 7 has no compiler API yet, so this package aliases `typescript`
// to `@typescript/typescript6` for typescript-eslint. Editors and builds use TS 7.
import tseslint from "typescript-eslint";

// Matching sections combine in order; later settings override earlier ones.
export default defineConfig(
  // An ignores-only section excludes generated output and dependencies globally.
  // Recursive patterns work from both the root and workspace configurations.
  {
    ignores: [
      "**/dist/**",
      "**/dist-ssr/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/.cache/**",
      "**/node_modules/**",
    ],
  },
  // Start with ESLint's recommended checks for common JavaScript mistakes.
  eslint.configs.recommended,
  // Give tooling access to Node globals such as process, Buffer, and require.
  // These local ignores only skip this section; browser code is still linted.
  {
    files: [
      "**/*.{js,mjs,cjs}",
      "**/*.config.{ts,mts,cts}",
      "**/scripts/**/*.{ts,mts,cts}",
    ],
    ignores: ["**/src/**", "**/components/**"],
    languageOptions: {
      globals: globals.node,
    },
  },
  // Use the TypeScript parser and the recommended type-aware rules for
  // TypeScript files. The project service loads each file's nearest
  // tsconfig.json, so rules such as no-floating-promises and no-unsafe-* can
  // use real type information without listing tsconfig paths here.
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true },
    },
    rules: {
      // Allow assertions such as document.getElementById("app")! at app startup.
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  // Configuration files are type-checked by a tsconfig.node.json (or the root
  // tsconfig.tools.json) that the project service cannot discover by name, so
  // they keep the syntax-only TypeScript rules. tsc still checks their types.
  {
    files: ["**/*.config.{ts,mts,cts}"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  // App source and shared components receive browser globals such as window
  // and document, including DOM tests located alongside those files.
  {
    files: [
      "**/src/**/*.{js,jsx,ts,tsx}",
      "**/components/**/*.{js,jsx,ts,tsx}",
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  // Enforce hook ordering, effect dependencies, and the other recommended React
  // checks. Include files without JSX because custom hooks can live there.
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    extends: [reactHooks.configs.flat.recommended],
  },
  // Component files: enable JSX syntax (TypeScript files retain their parser),
  // check markup for accessibility problems, and flag exports that would make
  // Vite's React Fast Refresh fall back to a full page reload. The Vite preset
  // allows constant exports next to a component, which Vite can still refresh.
  {
    files: ["**/*.{jsx,tsx}"],
    extends: [jsxA11y.flatConfigs.recommended, reactRefresh.configs.vite],
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  // Keep this last to disable lint rules that conflict with Prettier formatting.
  // It does not run Prettier; formatting is handled by separate commands.
  eslintConfigPrettier,
);
