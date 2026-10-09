import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Naira } from "./Naira";

afterEach(() => cleanup());

describe("Naira", () => {
  it("passes non-naira strings through untouched", () => {
    render(<Naira value="1,842,000" />);
    expect(screen.getByText("1,842,000")).toBeInTheDocument();
  });

  it("isolates the symbol so its bars never read as a strikethrough", () => {
    const { container } = render(<Naira value="₦873,200.00" />);
    const symbol = container.querySelector("span");
    expect(symbol?.textContent).toBe("₦");
    // Smaller, lighter, spaced: a currency marker, not a strike.
    expect(symbol?.className).toMatch(/text-\[0\.82em\]/);
    expect(symbol?.className).toMatch(/font-medium/);
    expect(symbol?.className).toMatch(/mr-\[0\.1em\]/);
    expect(container.textContent).toBe("₦873,200.00");
  });
});
