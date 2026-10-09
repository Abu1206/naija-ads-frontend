import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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
  { label: "6 Oct", impressions: 612000, clicks: 14200 },
  { label: "7 Oct", impressions: 748000, clicks: 18100 },
  { label: "8 Oct", impressions: 1104000, clicks: 28400 },
];

describe("DeliveryChart", () => {
  it("renders the combo without same-axis click bars", () => {
    const { container } = render(<DeliveryChart data={data} title="Delivery" metric="combo" />);
    expect(screen.queryByText(/^Clicks \(bars/)).toBeNull();
    // Gold reaches the CTR series through the chart config CSS var.
    const chart = container.querySelector('[data-slot="chart"]') as HTMLElement | null;
    expect(chart?.style.getPropertyValue("--color-ctr")).toBe("#A87A1F");
    expect(container.querySelector('.recharts-line [stroke="var(--color-ctr)"]')).not.toBeNull();
  });

  it("labels both axes so the dual scale reads without the legend", () => {
    render(<DeliveryChart data={data} title="Delivery" metric="combo" />);
    // Desktop combo and the mobile single-series view both render (CSS picks
    // the visible one), so axis titles appear more than once.
    expect(screen.getAllByText("Views").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("CTR %").length).toBeGreaterThanOrEqual(1);
  });

  it("snaps both axes to five round steps so the gridlines coincide", () => {
    // 1.104M max bars ÷ 0.43 fill snaps to 0–5M by 1M; ~2.6% max CTR ÷ 0.7
    // snaps to 0–5% by 1%. Same tick count from zero on both axes, so one set
    // of horizontal gridlines serves both.
    const { container } = render(<DeliveryChart data={data} title="Delivery" metric="combo" />);
    // Desktop and mobile trees both render (CSS picks the visible one), and
    // both now share the same round scale.
    expect(screen.getAllByText("5M").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("5%").length).toBeGreaterThanOrEqual(1);
    // The first chart in DOM order is the desktop combo: exactly the
    // five-interval lines, no more, no fewer.
    const combo = container.querySelectorAll(".recharts-wrapper")[0];
    expect(
      combo?.querySelectorAll(".recharts-cartesian-grid-horizontal line"),
    ).toHaveLength(6);
  });

  it("hides line dots until hover so a 30D line reads clean", () => {
    const { container } = render(<DeliveryChart data={data} title="Delivery" metric="combo" />);
    expect(container.querySelectorAll(".recharts-line circle")).toHaveLength(0);
  });

  it("renders nothing for empty series (callers own the empty state)", () => {
    const { container } = render(<DeliveryChart data={data.slice(0, 0)} title="Delivery" metric="combo" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("summarises CTR in the accessible label so the line is not colour-only", () => {
    const { container } = render(<DeliveryChart data={data} title="Delivery" metric="combo" />);
    const figure = container.querySelector("figure");
    expect(figure?.getAttribute("aria-label")).toMatch(/2\.32% CTR/);
    expect(figure?.getAttribute("aria-label")).toMatch(/612,000 impressions/);
  });

  it("gives the Clicks tab its own scale in the single-metric view", () => {
    render(<DeliveryChart data={data} title="Delivery" metric="clicks" />);
    expect(screen.getAllByText("Clicks").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("Views")).toBeNull();
    expect(screen.queryByText("CTR %")).toBeNull();
  });

  it("falls back to one metric at a time on narrow screens in Combo", () => {
    render(<DeliveryChart data={data} title="Delivery" metric="combo" />);
    const inner = screen.getByRole("tablist", { name: "Mobile chart metric" });
    expect(within(inner).getAllByRole("tab").map((t) => t.textContent)).toEqual([
      "Impressions",
      "Clicks",
      "CTR",
    ]);
    fireEvent.click(within(inner).getByRole("tab", { name: "CTR" }));
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
  });

  it("hides the mobile inner tabs when a single metric is already chosen", () => {
    render(<DeliveryChart data={data} title="Delivery" metric="ctr" />);
    expect(screen.queryByRole("tablist", { name: "Mobile chart metric" })).toBeNull();
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
