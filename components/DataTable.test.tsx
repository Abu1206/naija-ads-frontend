import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { DataTable } from "./DataTable";

afterEach(() => cleanup());

const columns = [
  { key: "name", header: "Campaign", render: (r: { id: string; name: string }) => r.name },
  { key: "spend", header: "Spend", render: () => "₦1,000.00" },
];

const rows = [{ id: "a", name: "Indomie Rewarded Video" }];

describe("DataTable", () => {
  it("renders title and action with no divider between header and table", () => {
    const { container } = render(
      <DataTable
        title="Campaign performance"
        action={<a href="/business/campaigns">View all</a>}
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
      />,
    );
    expect(screen.getByText("Campaign performance")).toBeInTheDocument();
    expect(container.querySelector("header")?.className).not.toMatch(/border-b/);
  });

  it("stands alone in one frame: no nested table border, row dividers only", () => {
    const { container } = render(
      <DataTable title="Campaign performance" columns={columns} rows={rows} getRowKey={(r) => r.id} />,
    );
    // The scroll wrapper carries no border of its own.
    expect(container.querySelector(".overflow-x-auto")?.className).not.toMatch(/border/);
    expect(container.querySelector("tbody")?.className).toMatch(/divide-y/);
    expect(container.querySelector("table")?.className).toMatch(/tabular-nums/);
  });

  it("right-aligns numeric columns, left-aligns the rest", () => {
    const { container } = render(
      <DataTable
        columns={[
          { key: "name", header: "Campaign", render: (r: { id: string }) => r.id },
          { key: "spend", header: "Spend", numeric: true, render: () => "₦1.00" },
        ]}
        rows={[{ id: "a" }]}
        getRowKey={(r) => r.id}
      />,
    );
    const headers = container.querySelectorAll("th");
    expect(headers[0]?.className).toMatch(/text-left/);
    expect(headers[1]?.className).toMatch(/text-right/);
    const cells = container.querySelectorAll("td");
    expect(cells[0]?.className).toMatch(/text-left/);
    expect(cells[1]?.className).toMatch(/text-right/);
  });

  it("keeps loading, error and empty states", () => {
    const { rerender } = render(
      <DataTable columns={columns} rows={[]} loading getRowKey={(r) => r.id} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
    rerender(<DataTable columns={columns} rows={[]} error="Boom" getRowKey={(r) => r.id} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Boom");
    rerender(
      <DataTable columns={columns} rows={[]} emptyMessage="Nothing here" getRowKey={(r) => r.id} />,
    );
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });
});
