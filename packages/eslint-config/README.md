# `@repo/eslint-config`

This package provides the shared ESLint flat configuration for the monorepo. Apps and packages call it from their local `eslint.config.ts` files so linting rules stay consistent across workspaces.

The implementation is `index.ts`, exported as an ES module and checked by this package's `tsconfig.json` and `check-types` script. Root `pnpm check-types` runs that task through Turbo. The `eslint.config.ts` entry files are TypeScript too, and each is included by its workspace's tooling tsconfig so `check-types` covers it. ESLint loads a TypeScript configuration file, and the TypeScript modules it imports such as this package, through the `jiti` loader rather than Node's built-in type stripping; native loading is opt-in behind ESLint's `unstable_native_nodejs_ts_config` flag. The ESLint documentation therefore requires `jiti` as a development dependency, so every workspace that runs ESLint declares it from the catalog.

The configuration combines ESLint's recommended JavaScript rules, the recommended type-aware TypeScript ESLint rules, React Hooks' recommended rules, ESLint React's recommended type-checked rules, `jsx-a11y`'s recommended accessibility rules, `react-refresh`'s Vite preset, `simple-import-sort`'s import and export ordering, and Prettier compatibility. TypeScript rules apply only to TypeScript files; JavaScript tooling and Node configuration files receive Node globals, while `src` and `components` directories receive browser globals. Non-null assertions remain allowed.

Type-aware rules use typescript-eslint's project service, which loads the `tsconfig.json` nearest to each linted file and follows its project references, so no tsconfig paths are listed in the configuration. Configuration files are covered by each workspace's `tsconfig.node.json` or the root `tsconfig.tools.json`, so they receive the same type-aware rules as source. A new source directory only needs to be included by one of the referenced projects to receive type-aware linting.

[ESLint React](https://eslint-react.xyz) (`@eslint-react/eslint-plugin`) applies to `.ts` and `.tsx` files, because its recommended type-checked preset includes rules that need type information, such as `no-leaked-conditional-rendering`, which reports `{count && <Item />}` when `count` can render `0`. The preset also includes its own copies of the React Hooks rules; those are turned off so hook problems are reported once, by `eslint-plugin-react-hooks`. `dom-no-unsafe-target-blank`, which requires `rel="noreferrer"` on `target="_blank"` links, is enabled as an error on top of the preset. The React version is detected from the installed package.

The accessibility and Fast Refresh rules apply to `.jsx` and `.tsx` files. `@vitejs/plugin-react` implements Fast Refresh itself; the `react-refresh/only-export-components` rule only reports files whose exports would make Vite fall back to a full reload, such as a component file that also exports a hook or a helper function. Constant exports next to a component are allowed because Vite can still refresh them.

Imports and `export … from` statements are sorted in every JavaScript and TypeScript file: side-effect imports first, then `node:` builtins, packages, absolute paths, and relative paths, each group separated by a blank line. Both rules autofix, so `eslint --fix` and lint-staged reorder them.

Generated build output, coverage, dependency directories, and tool caches are ignored. The root flat configuration applies this preset to root tooling only and ignores `apps/` and `packages/`; each workspace applies it through its own `eslint.config.ts` and `lint` script, which root `pnpm lint` runs through Turbo. Staged code uses the same preset.

## Usage

```ts
import createConfig from "@repo/eslint-config";

export default createConfig(import.meta.dirname);
```

The argument becomes typescript-eslint's `tsconfigRootDir`. Passing it explicitly matters in editors, whose single ESLint process loads several workspace configurations and cannot otherwise infer which directory a file belongs to.

The package aliases TypeScript 6 for TypeScript ESLint's compiler integration; application builds and editor tooling use the repository's primary TypeScript version.
