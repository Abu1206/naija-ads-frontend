import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DeliveryChart, deliveryLabel } from "./DeliveryChart";

afterEach(() => cleanup());

const data = [
  { label: "2026-05", impressions: 612000, clicks: 14200 },
  { label: "2026-06", impressions: 748000, clicks: 18100 },
  { label: "2026-07", impressions: 1104000, clicks: 28400 },
];

describe("DeliveryChart", () => {
  it("legends green view bars plus a gold CTR line, never same-axis click bars", () => {
    const { container } = render(<DeliveryChart data={data} ariaLabel="Delivery over time" />);
    expect(screen.getByText(/Views \(bars/)).toBeInTheDocument();
    expect(screen.getByText(/CTR % \(line/)).toBeInTheDocument();
    expect(screen.queryByText(/^Clicks \(bars/)).toBeNull();
    expect(container.querySelector('path[stroke="#CFA24A"]')).not.toBeNull();
  });

  it("labels both axes so the dual scale reads without the legend", () => {
    render(<DeliveryChart data={data} ariaLabel="Delivery over time" />);
    // Desktop combo and the mobile single-series view both render (CSS picks
    // the visible one), so axis titles appear more than once.
    expect(screen.getAllByText("Views").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("CTR %").length).toBeGreaterThanOrEqual(1);
  });

  it("summarises CTR in the accessible label so the line is not colour-only", () => {
    const { container } = render(<DeliveryChart data={data} ariaLabel="Delivery over time" />);
    const figure = container.querySelector("figure");
    expect(figure?.getAttribute("aria-label")).toMatch(/2\.32% CTR/);
    expect(figure?.getAttribute("aria-label")).toMatch(/612,000 impressions/);
  });

  it("reveals raw clicks in a tooltip on hover/focus", () => {
    render(<DeliveryChart data={data} ariaLabel="Delivery over time" />);
    fireEvent.focus(screen.getAllByRole("img", { name: /2026-07:/ })[0]!);
    expect(screen.getByRole("status")).toHaveTextContent("28,400 clicks");
    expect(screen.getByRole("status")).toHaveTextContent("2.57% CTR");
  });

  it("offers single-metric tabs for small screens", () => {
    render(<DeliveryChart data={data} ariaLabel="Delivery over time" />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toEqual(["Impressions", "Clicks", "CTR"]);
    fireEvent.click(screen.getByRole("tab", { name: "CTR" }));
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
  });

  it("caps the window at the last 30 points for a daily grain", () => {
    const daily = Array.from({ length: 35 }, (_, i) => ({
      label: `d${String(i + 1).padStart(2, "0")}`,
      impressions: 10000 + i * 100,
      clicks: 200 + i * 2,
    }));
    const { container } = render(<DeliveryChart data={daily} ariaLabel="Delivery over time" />);
    const summary = container.querySelector("figure")?.getAttribute("aria-label") ?? "";
    expect(summary).toContain("d35");
    expect(summary).not.toContain("d01");
  });

  it("renders nothing for empty series (callers own the empty state)", () => {
    const { container } = render(<DeliveryChart data={[]} ariaLabel="Delivery over time" />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("deliveryLabel", () => {
  it("passes monthly periods through", () => {
    expect(deliveryLabel("2026-05")).toBe("2026-05");
  });

  it("shortens daily periods for axis duty", () => {
    expect(deliveryLabel("2026-10-03")).toContain("Oct");
  });
});
