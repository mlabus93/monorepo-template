import type { Configuration } from "lint-staged";

export default {
  "*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}": ["eslint --fix", "prettier --write"],
  "!(*.{js,jsx,mjs,cjs,ts,tsx,mts,cts})": "prettier --ignore-unknown --write",
  // A function so lint-staged does not append the file path to the command.
  "pnpm-lock.yaml": () => "pnpm dedupe",
} satisfies Configuration;
