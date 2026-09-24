# `@repo/eslint-config`

This package provides the shared ESLint flat configuration for the monorepo. Apps and packages import it from their local `eslint.config.*` files so linting rules stay consistent across workspaces.

The implementation is `index.ts`, exported as an ES module and checked by this package's `tsconfig.json` and `check-types` script. Root `pnpm check-types` runs that task through Turbo. Node's built-in type stripping loads this local workspace package using the repository's required Node version. The small `eslint.config.js` entry files remain JavaScript so ESLint does not need a TypeScript configuration loader or feature flag.

The configuration combines ESLint's recommended JavaScript rules, the recommended type-aware TypeScript ESLint rules, React Hooks' recommended rules, `jsx-a11y`'s recommended accessibility rules, `react-refresh`'s Vite preset, and Prettier compatibility. TypeScript rules apply only to TypeScript files; JavaScript tooling and Node configuration files receive Node globals, while `src` and `components` directories receive browser globals. Non-null assertions remain allowed.

Type-aware rules use typescript-eslint's project service, which loads the `tsconfig.json` nearest to each linted file, so no tsconfig paths are listed in the configuration. Files that a workspace's `tsconfig.json` does not include, which in this repository are the `*.config.ts` files covered by `tsconfig.node.json` and the root `tsconfig.tools.json`, fall back to the syntax-only TypeScript rules; `tsc` still type-checks them. A new source directory outside `src` only needs to be included by the nearest `tsconfig.json` to receive type-aware linting.

The accessibility and Fast Refresh rules apply to `.jsx` and `.tsx` files. `@vitejs/plugin-react` implements Fast Refresh itself; the `react-refresh/only-export-components` rule only reports files whose exports would make Vite fall back to a full reload, such as a component file that also exports a hook or a helper function. Constant exports next to a component are allowed because Vite can still refresh them.

Generated build output, coverage, dependency directories, and tool caches are ignored. The root flat configuration applies this preset to root tooling only and ignores `apps/` and `packages/`; each workspace applies it through its own `eslint.config.js` and `lint` script, which root `pnpm lint` runs through Turbo. Staged code uses the same preset.

## Usage

```js
import config from "@repo/eslint-config";

export default config;
```

The package aliases TypeScript 6 for TypeScript ESLint's compiler integration; application builds and editor tooling use the repository's primary TypeScript version.
