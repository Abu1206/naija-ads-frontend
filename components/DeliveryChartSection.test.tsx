import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { DeliveryChartSection } from "./DeliveryChartSection";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/business",
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  push.mockClear();
});

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

function renderSection(props?: { range?: "7d" | "30d" | "90d" | "6m"; metric?: "combo" | "impressions" | "clicks" | "ctr" }) {
  return render(
    <DeliveryChartSection
      data={data}
      title="Delivery"
      range={props?.range ?? "30d"}
      metric={props?.metric ?? "combo"}
    />,
  );
}

describe("DeliveryChartSection toolbar", () => {
  it("pairs the metric dropdown with a range dropdown in one row", () => {
    renderSection();
    // Two native selects side by side — no breakpoints, no stacking.
    expect(screen.getByLabelText("Chart metric")).toBeInTheDocument();
    const metric = screen.getByLabelText("Chart metric") as HTMLSelectElement;
    expect(metric.value).toBe("combo");
    expect([...metric.options].map((o) => o.textContent)).toEqual([
      "Combo",
      "Impressions",
      "Clicks",
      "CTR",
    ]);
    const range = screen.getByLabelText("Time range") as HTMLSelectElement;
    expect(range.value).toBe("30d");
    expect([...range.options].map((o) => o.textContent)).toEqual([
      "Last 7 days",
      "Last 30 days",
      "Last 90 days",
      "Last 6 months",
    ]);
  });

  it("navigates on range change, preserving the metric for shareable links", () => {
    renderSection({ metric: "ctr" });
    fireEvent.change(screen.getByLabelText("Time range"), { target: { value: "7d" } });
    expect(push).toHaveBeenCalledWith("/business?range=7d&metric=ctr", { scroll: false });
  });

  it("mirrors metric changes to the URL without navigating", () => {
    const replace = vi.spyOn(window.history, "replaceState");
    renderSection();
    fireEvent.change(screen.getByLabelText("Chart metric"), { target: { value: "clicks" } });
    expect(push).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith(null, "", "/business?range=30d&metric=clicks");
  });
});

describe("DeliveryChartSection legend", () => {
  it("shows the Impressions + CTR legend on its own line in Combo only", () => {
    const { container } = renderSection();
    expect(container.querySelector('svg line[stroke="#A87A1F"]')).not.toBeNull();
    fireEvent.change(screen.getByLabelText("Chart metric"), { target: { value: "impressions" } });
    expect(container.querySelector('svg line[stroke="#A87A1F"]')).toBeNull();
    expect(screen.queryByText("CTR %")).toBeNull();
  });
});

describe("DeliveryChartSection empty state", () => {
  it("shows the empty state instead of one lonely dot", () => {
    const { container } = render(
      <DeliveryChartSection data={data.slice(0, 2)} title="Delivery" range="30d" metric="combo" />,
    );
    expect(
      screen.getByText("Your chart appears once ads start delivering"),
    ).toBeInTheDocument();
    expect(container.querySelector('[data-slot="chart"]')).toBeNull();
    expect(screen.queryByRole("tablist", { name: "Chart metric" })).toBeNull();
  });
});
