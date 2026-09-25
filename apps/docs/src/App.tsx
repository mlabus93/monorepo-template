import { Counter, Header } from "@repo/ui";

import typescriptLogo from "/typescript.svg";

import styles from "./app.module.css";

export const App = () => (
  <div className={styles.app}>
    <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
      <img src="/vite.svg" className={styles.logo} alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer">
      <img
        src={typescriptLogo}
        className={`${styles.logo} ${styles.typescriptLogo}`}
        alt="TypeScript logo"
      />
    </a>
    <Header title="Docs" />
    <div className={styles.card}>
      <Counter />
    </div>
  </div>
);
