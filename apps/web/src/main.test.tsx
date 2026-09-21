import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";

test("renders the web application", async () => {
  const user = userEvent.setup();
  document.body.innerHTML = '<div id="app"></div>';

  await act(async () => {
    await import("./main");
  });

  expect(screen.getByRole("heading", { name: "Web" })).toBeInTheDocument();

  const counter = screen.getByRole("button", { name: "0" });
  await user.click(counter);
  expect(counter).toHaveTextContent(/^1$/);
});
