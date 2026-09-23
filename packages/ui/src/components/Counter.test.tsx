import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";

import { Counter } from "./Counter";

test("increments the counter when clicked", async () => {
  const user = userEvent.setup();
  render(<Counter />);

  const counter = screen.getByRole("button", { name: "0" });
  await user.click(counter);
  expect(counter).toHaveTextContent(/^1$/);
});

test("starts with a clean DOM and a fresh counter in the next test", () => {
  expect(screen.queryByRole("button")).not.toBeInTheDocument();

  render(<Counter />);
  expect(screen.getByRole("button")).toHaveTextContent(/^0$/);
});
