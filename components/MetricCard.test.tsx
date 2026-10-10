import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MetricCard } from "./MetricCard";

afterEach(() => cleanup());

describe("MetricCard", () => {
  it("stretches with its row and pins bottom content to a shared baseline", () => {
    const { container } = render(
      <MetricCard
        label="Impressions"
        value="1,842,000"
        delta={{ text: "↑ 9.6%", direction: "up", caption: "vs Sep" }}
      />,
    );
    const root = container.firstElementChild;
    expect(root?.className).toMatch(/flex-col/);
    expect(root?.className).toMatch(/self-stretch/);
    const bottom = container.querySelector(".mt-auto");
    expect(bottom?.textContent).toContain("↑ 9.6%");
  });

  it("renders the footer in the pinned zone", () => {
    render(
      <MetricCard
        label="Remaining budget"
        value="₦11,065,000.00"
        tone="money"
        footer={<p>₦873,200.00 spent</p>}
      />,
    );
    expect(screen.getByText("₦873,200.00 spent")).toBeInTheDocument();
  });

  it("adds no bottom zone when there is nothing to pin", () => {
    const { container } = render(<MetricCard label="Clicks" value="46,100" />);
    expect(container.querySelector(".mt-auto")).toBeNull();
  });

  it("names the value scope in the hint slot", () => {
    render(<MetricCard label="Impressions" value="1,842,000" hint="All-time" />);
    expect(screen.getByText("All-time")).toBeInTheDocument();
  });
});
