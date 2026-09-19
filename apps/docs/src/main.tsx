import { Counter, Header } from "@repo/ui";
import { createRoot } from "react-dom/client";

import typescriptLogo from "/typescript.svg";
import styles from "./app.module.css";

const App = () => (
  <div className={styles.app}>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" className={styles.logo} alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
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

createRoot(document.getElementById("app")!).render(<App />);
