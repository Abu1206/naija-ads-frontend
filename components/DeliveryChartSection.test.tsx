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
  it("pairs metric tabs with a range radiogroup in one row", () => {
    renderSection();
    const tabs = screen.getByRole("tablist", { name: "Chart metric" });
    expect(within(tabs).getAllByRole("tab").map((t) => t.textContent)).toEqual([
      "Combo",
      "Impressions",
      "Clicks",
      "CTR",
    ]);
    expect(within(tabs).getByRole("tab", { name: "Combo" })).toHaveAttribute("aria-selected", "true");
    const radios = screen.getByRole("radiogroup", { name: "Time range" });
    expect(within(radios).getAllByRole("radio").map((r) => r.textContent)).toEqual([
      "7D",
      "30D",
      "90D",
      "6M",
    ]);
    expect(within(radios).getByRole("radio", { name: "30D" })).toHaveAttribute("aria-checked", "true");
  });

  it("marks the selected pills white with Naija Green text", () => {
    const { container } = renderSection();
    const selected = container.querySelector('[aria-selected="true"]');
    expect(selected?.className).toContain("bg-white");
    expect(selected?.className).toContain("text-naija");
  });

  it("navigates on range change, preserving the metric for shareable links", () => {
    renderSection({ metric: "ctr" });
    const radios = screen.getByRole("radiogroup", { name: "Time range" });
    fireEvent.click(within(radios).getByRole("radio", { name: "7D" }));
    expect(push).toHaveBeenCalledWith("/business?range=7d&metric=ctr", { scroll: false });
  });

  it("mirrors metric taps to the URL without navigating", () => {
    const replace = vi.spyOn(window.history, "replaceState");
    renderSection();
    const tabs = screen.getByRole("tablist", { name: "Chart metric" });
    fireEvent.click(within(tabs).getByRole("tab", { name: "Clicks" }));
    expect(push).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith(null, "", "/business?range=30d&metric=clicks");
    expect(within(tabs).getByRole("tab", { name: "Clicks" })).toHaveAttribute("aria-selected", "true");
  });

  it("moves metric selection with arrow keys", () => {
    renderSection();
    const tabs = screen.getByRole("tablist", { name: "Chart metric" });
    const combo = within(tabs).getByRole("tab", { name: "Combo" });
    combo.focus();
    fireEvent.keyDown(tabs, { key: "ArrowRight" });
    expect(within(tabs).getByRole("tab", { name: "Impressions" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});

describe("DeliveryChartSection legend", () => {
  it("shows the Views + CTR legend on its own line in Combo only", () => {
    const { container } = renderSection();
    expect(container.querySelector('svg line[stroke="#A87A1F"]')).not.toBeNull();
    const tabs = screen.getByRole("tablist", { name: "Chart metric" });
    fireEvent.click(within(tabs).getByRole("tab", { name: "Impressions" }));
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
