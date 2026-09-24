import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { Header } from "./Header";

test("renders the title as a heading", () => {
  render(<Header title="Welcome" />);

  expect(screen.getByRole("heading", { name: "Welcome" })).toBeInTheDocument();
});
