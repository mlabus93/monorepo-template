import type { Configuration } from "lint-staged";

export default {
  "*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}": ["eslint --fix", "prettier --write"],
  "!(*.{js,jsx,mjs,cjs,ts,tsx,mts,cts})": "prettier --ignore-unknown --write",
} satisfies Configuration;
