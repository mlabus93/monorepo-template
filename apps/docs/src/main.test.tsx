import { act, fireEvent, screen } from "@testing-library/react";
import { expect, test } from "vitest";

test("renders the docs application", async () => {
  document.body.innerHTML = '<div id="app"></div>';

  await act(async () => {
    await import("./main");
  });

  expect(screen.getByRole("heading", { name: "Docs" })).toBeDefined();

  const counter = screen.getByRole("button", { name: "0" });
  fireEvent.click(counter);
  expect(counter.textContent).toBe("1");
});
