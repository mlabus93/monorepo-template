import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { Counter } from "./counter";

test("increments the counter when clicked", () => {
  render(<Counter />);

  const counter = screen.getByRole("button", { name: "0" });
  fireEvent.click(counter);
  expect(counter.textContent).toBe("1");
});

test("starts with a clean DOM and a fresh counter in the next test", () => {
  expect(screen.queryByRole("button")).toBeNull();

  render(<Counter />);
  expect(screen.getByRole("button").textContent).toBe("0");
});
