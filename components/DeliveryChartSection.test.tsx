import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
  // Radix scrolls the highlighted item into view; jsdom has no layout to do it.
  Element.prototype.scrollIntoView = () => {};
});

const data = [
  { label: "6 Oct", impressions: 612000, clicks: 14200 },
  { label: "7 Oct", impressions: 748000, clicks: 18100 },
  { label: "8 Oct", impressions: 1104000, clicks: 28400 },
];

function renderSection(props?: {
  range?: "7d" | "30d" | "90d" | "6m";
  metric?: "combo" | "impressions" | "clicks" | "ctr";
}) {
  return render(
    <DeliveryChartSection
      data={data}
      title="Delivery"
      range={props?.range ?? "30d"}
      metric={props?.metric ?? "combo"}
    />,
  );
}

/** Radix opens the menu on Enter/Space/ArrowDown from the trigger. */
function openMenu(label: string) {
  const trigger = screen.getByRole("button", { name: label });
  fireEvent.keyDown(trigger, { key: "Enter" });
  return trigger;
}

describe("DeliveryChartSection toolbar", () => {
  it("pairs the metric dropdown with a range dropdown in one row", () => {
    renderSection();
    // Two triggers side by side — no breakpoints, no stacking.
    for (const name of ["Chart metric", "Time range"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
    expect(
      within(screen.getByRole("button", { name: "Chart metric" })).getByText("Combo"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("button", { name: "Time range" })).getByText("Last 30 days"),
    ).toBeInTheDocument();
  });

  it("keeps both triggers at the 44px touch minimum", () => {
    renderSection();
    for (const name of ["Chart metric", "Time range"]) {
      expect(screen.getByRole("button", { name }).className).toContain("h-11");
    }
  });

  it("lists every metric and every range in the menu", async () => {
    renderSection();
    openMenu("Chart metric");
    expect(screen.getAllByRole("menuitemradio").map((i) => i.textContent)).toEqual([
      "Combo",
      "Impressions",
      "Clicks",
      "CTR",
    ]);
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    openMenu("Time range");
    expect(screen.getAllByRole("menuitemradio").map((i) => i.textContent)).toEqual([
      "Last 7 days",
      "Last 30 days",
      "Last 90 days",
      "Last 6 months",
    ]);
  });

  it("marks the current value checked and ticks it — never colour alone", () => {
    renderSection();
    openMenu("Chart metric");
    const combo = screen.getByRole("menuitemradio", { name: "Combo" });
    const clicks = screen.getByRole("menuitemradio", { name: "Clicks" });
    expect(combo).toHaveAttribute("aria-checked", "true");
    expect(clicks).toHaveAttribute("aria-checked", "false");
    expect(combo.querySelector("svg")).not.toBeNull();
    expect(clicks.querySelector("svg")).toBeNull();
  });

  it("navigates on range change, preserving the metric for shareable links", () => {
    renderSection({ metric: "ctr" });
    openMenu("Time range");
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Last 7 days" }));
    expect(push).toHaveBeenCalledWith("/business?range=7d&metric=ctr", { scroll: false });
  });

  it("mirrors metric changes to the URL without navigating", async () => {
    const replace = vi.spyOn(window.history, "replaceState");
    renderSection();
    openMenu("Chart metric");
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Clicks" }));
    expect(push).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith(null, "", "/business?range=30d&metric=clicks");
    // Selecting closes the menu (Radix dismisses the layer once the item
    // selects — its exit animation finishes first).
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    expect(
      within(screen.getByRole("button", { name: "Chart metric" })).getByText("Clicks"),
    ).toBeInTheDocument();
  });
});

describe("DeliveryChartSection legend", () => {
  it("shows the Impressions + CTR legend on its own line in Combo only", () => {
    const { container } = renderSection();
    expect(container.querySelector('svg line[stroke="#A87A1F"]')).not.toBeNull();
    openMenu("Chart metric");
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Impressions" }));
    expect(container.querySelector('svg line[stroke="#A87A1F"]')).toBeNull();
    expect(screen.queryByText("CTR %")).toBeNull();
  });
});

describe("DeliveryChartSection empty state", () => {
  it("shows the empty state instead of one lonely dot", () => {
    const { container } = render(
      <DeliveryChartSection data={data.slice(0, 2)} title="Delivery" range="30d" metric="combo" />,
    );
    expect(screen.getByText("Your chart appears once ads start delivering")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="chart"]')).toBeNull();
    expect(screen.queryByRole("button", { name: "Chart metric" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Time range" })).toBeNull();
  });
});
