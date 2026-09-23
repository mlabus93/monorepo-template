import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";

import { App } from "./App";

test("renders the docs application", async () => {
  const user = userEvent.setup();
  render(<App />);

  expect(screen.getByRole("heading", { name: "Docs" })).toBeInTheDocument();

  const counter = screen.getByRole("button", { name: "0" });
  await user.click(counter);
  expect(counter).toHaveTextContent(/^1$/);
});
