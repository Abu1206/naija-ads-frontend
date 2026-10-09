import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SpendFooter } from "./SpendFooter";

afterEach(() => cleanup());

describe("SpendFooter", () => {
  it("shows spent underneath and the utilization bar, with no fund action", () => {
    const { container } = render(<SpendFooter spendKobo={87320000} remainingKobo={1106500000} />);
    // Secondary spent line under the Remaining hero (which lives in MetricCard).
    expect(container.textContent).toContain("₦873,200.00");
    expect(screen.getByText("spent")).toBeInTheDocument();
    expect(screen.getByText("7.3% used")).toBeInTheDocument();
    const bar = screen.getByRole("progressbar", { name: "Budget used" });
    expect(bar).toHaveAttribute("aria-valuenow", "7.3");
    // Funding lives on /business/billing, not in this KPI tile.
    expect(screen.queryByRole("link", { name: /fund/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /fund/i })).toBeNull();
  });

  it("renders an empty bar with no percentage when there is no budget", () => {
    render(<SpendFooter spendKobo={0} remainingKobo={0} />);
    expect(screen.getByRole("progressbar", { name: "Budget used" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    expect(screen.queryByText(/used/)).toBeNull();
  });
});
