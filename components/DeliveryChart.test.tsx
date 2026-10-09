import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DeliveryChart, DeliveryTooltipContent, deliveryLabel } from "./DeliveryChart";

afterEach(() => cleanup());

// jsdom has no layout: recharts' ResponsiveContainer only renders once its
// ResizeObserver fires, so report a fixed chart area.
beforeAll(() => {
  const MockRO = class {
    private cb: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) {
      this.cb = cb;
    }
    observe(target: Element) {
      this.cb(
        [{ target, contentRect: { width: 600, height: 300 } } as unknown as ResizeObserverEntry],
        this as unknown as ResizeObserver,
      );
    }
    unobserve() {}
    disconnect() {}
  };
  global.ResizeObserver = MockRO as unknown as typeof ResizeObserver;
});

const data = [
  { label: "2026-05", impressions: 612000, clicks: 14200 },
  { label: "2026-06", impressions: 748000, clicks: 18100 },
  { label: "2026-07", impressions: 1104000, clicks: 28400 },
];

describe("DeliveryChart", () => {
  it("legends Views bars plus a gold CTR line, never same-axis click bars", () => {
    const { container } = render(<DeliveryChart data={data} title="Delivery" />);
    // Axis titles already carry the mapping, so the legend stays short.
    expect(screen.queryByText(/bars ·/)).toBeNull();
    expect(screen.queryByText(/line ·/)).toBeNull();
    expect(screen.getAllByText("Views").length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText(/^Clicks \(bars/)).toBeNull();
    // Gold reaches the CTR series through the chart config CSS var.
    const chart = container.querySelector('[data-slot="chart"]') as HTMLElement | null;
    expect(chart?.style.getPropertyValue("--color-ctr")).toBe("#A87A1F");
    expect(container.querySelector('.recharts-line [stroke="var(--color-ctr)"]')).not.toBeNull();
  });

  it("labels both axes so the dual scale reads without the legend", () => {
    render(<DeliveryChart data={data} title="Delivery" />);
    // Desktop combo and the mobile single-series view both render (CSS picks
    // the visible one), so axis titles appear more than once.
    expect(screen.getAllByText("Views").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("CTR %").length).toBeGreaterThanOrEqual(1);
  });

  it("lifts the left axis ceiling so bars sit below the CTR line", () => {
    // 1.104M max × 1.6 headroom snaps to a 2M ceiling (current data lands on 3M).
    render(<DeliveryChart data={data} title="Delivery" />);
    expect(screen.getByText("2M")).toBeInTheDocument();
  });

  it("hints touch users in the header instead of a footer", () => {
    const { container } = render(<DeliveryChart data={data} title="Delivery" />);
    expect(screen.getByText("Tap a point for clicks")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="card-footer"]')).toBeNull();
  });
    const { container } = render(<DeliveryChart data={data} title="Delivery" />);
    const figure = container.querySelector("figure");
    expect(figure?.getAttribute("aria-label")).toMatch(/2\.32% CTR/);
    expect(figure?.getAttribute("aria-label")).toMatch(/612,000 impressions/);
  });

  it("offers single-metric tabs for small screens", () => {
    render(<DeliveryChart data={data} title="Delivery" />);
    expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual([
      "Impressions",
      "Clicks",
      "CTR",
    ]);
    fireEvent.click(screen.getByRole("tab", { name: "CTR" }));
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
  });

  it("caps the window at the last 30 points for a daily grain", () => {
    const daily = Array.from({ length: 35 }, (_, i) => ({
      label: `d${String(i + 1).padStart(2, "0")}`,
      impressions: 10000 + i * 100,
      clicks: 200 + i * 2,
    }));
    const { container } = render(<DeliveryChart data={daily} title="Delivery" />);
    const summary = container.querySelector("figure")?.getAttribute("aria-label") ?? "";
    expect(summary).toContain("d35");
    expect(summary).not.toContain("d01");
  });

  it("renders nothing for empty series (callers own the empty state)", () => {
    const { container } = render(<DeliveryChart data={[]} title="Delivery" />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("DeliveryTooltipContent", () => {
  it("shows views, raw clicks and CTR together", () => {
    render(
      <DeliveryTooltipContent
        active
        label="2026-07"
        payload={[{ payload: { label: "2026-07", views: 1104000, clicks: 28400, ctr: 0.0257 } }]}
      />,
    );
    expect(screen.getByText("1,104,000 views")).toBeInTheDocument();
    expect(screen.getByText("28,400 clicks")).toBeInTheDocument();
    expect(screen.getByText("2.57% CTR")).toBeInTheDocument();
  });

  it("renders nothing when inactive or empty", () => {
    const { container } = render(<DeliveryTooltipContent active={false} payload={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("deliveryLabel", () => {
  it("shortens monthly periods to short month names", () => {
    expect(deliveryLabel("2026-05")).toBe("May");
  });

  it("shortens daily periods for axis duty", () => {
    expect(deliveryLabel("2026-10-03")).toContain("Oct");
  });
});
