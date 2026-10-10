import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { FundForm } from "./FundForm";

afterEach(() => cleanup());

describe("FundForm", () => {
  it("fills the field from a quick amount", () => {
    render(<FundForm />);
    fireEvent.click(screen.getByRole("button", { name: "₦10,000" }));
    expect(screen.getByLabelText("Amount")).toHaveValue("10000");
  });

  it("marks the chosen quick amount as pressed", () => {
    render(<FundForm />);
    const chip = screen.getByRole("button", { name: "₦50,000" });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");
  });
});
