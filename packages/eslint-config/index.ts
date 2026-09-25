import eslint from "@eslint/js";
import react from "@eslint-react/eslint-plugin";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
// TypeScript 7 has no compiler API yet, so this package aliases `typescript`
// to `@typescript/typescript6` for typescript-eslint. Editors and builds use TS 7.
import tseslint from "typescript-eslint";

// Each workspace passes its own directory as `tsconfigRootDir`. typescript-eslint
// otherwise infers it from the call stack, and an editor's long-lived ESLint
// process that loads several workspace configurations at once finds multiple
// candidates and refuses to parse TypeScript files.
// Matching sections combine in order; later settings override earlier ones.
export default function createConfig(tsconfigRootDir: string) {
  return defineConfig(
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
    // tsconfig.json and follows its project references, so configuration files
    // covered by tsconfig.node.json or tsconfig.tools.json get real type
    // information too, without listing tsconfig paths here.
    {
      files: ["**/*.{ts,tsx,mts,cts}"],
      extends: [tseslint.configs.recommendedTypeChecked],
      languageOptions: {
        parserOptions: { projectService: true, tsconfigRootDir },
      },
      rules: {
        // Allow assertions such as document.getElementById("app")! at app startup.
        "@typescript-eslint/no-non-null-assertion": "off",
      },
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
    // Apply ESLint React's recommended checks for components, JSX, the DOM, and
    // leaked browser resources, including its type-aware rules, so this section
    // covers TypeScript files only. The preset also ships its own copies of the
    // React Hooks rules; turn those off so each problem is reported once, by
    // the React team's plugin above. Also require rel="noreferrer" on
    // target="_blank" links, which the preset leaves to its strict variant.
    {
      files: ["**/*.{ts,tsx}"],
      extends: [react.configs["recommended-type-checked"]],
      rules: {
        ...Object.fromEntries(
          Object.keys(
            react.configs["disable-conflict-eslint-plugin-react-hooks"].rules ??
              {},
          ).map((rule) => [
            rule.replace("react-hooks/", "@eslint-react/"),
            "off",
          ]),
        ),
        "@eslint-react/dom-no-unsafe-target-blank": "error",
      },
    },
    // Sort imports and re-exports so their order is deterministic. Both rules
    // are autofixable, so `eslint --fix` and lint-staged reorder them.
    {
      files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
      plugins: { "simple-import-sort": simpleImportSort },
      rules: {
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
      },
    },
    // Keep this last to disable lint rules that conflict with Prettier formatting.
    // It does not run Prettier; formatting is handled by separate commands.
    eslintConfigPrettier,
  );
}
