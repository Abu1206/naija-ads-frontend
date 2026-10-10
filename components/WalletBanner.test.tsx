import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { WalletBanner } from "./WalletBanner";

afterEach(() => cleanup());

describe("WalletBanner", () => {
  it("renders nothing while the wallet is healthy", () => {
    const { container } = render(<WalletBanner spendKobo={70000000} remainingKobo={30000000} />);
    expect(container.firstElementChild).toBeNull();
  });

  it("renders nothing with no budget history at all", () => {
    const { container } = render(<WalletBanner spendKobo={0} remainingKobo={0} />);
    expect(container.firstElementChild).toBeNull();
  });

  it("appears at the low-balance line with the remaining amount and a top-up path", () => {
    render(<WalletBanner spendKobo={85000000} remainingKobo={15000000} />);
    expect(screen.getByText(/Wallet running low/)).toBeInTheDocument();
    expect(screen.getByText(/₦150,000\.00 remaining/)).toBeInTheDocument();
    expect(screen.getByText(/85\.0% used/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Top up wallet" })).toHaveAttribute(
      "href",
      "/business/billing",
    );
  });
});
