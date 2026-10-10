import { budgetUtilization, formatKobo, formatShare } from "@/lib/format";
import { LOW_BALANCE_THRESHOLD } from "@/lib/insights";
import { Icon } from "./Icon";

interface WalletBannerProps {
  spendKobo: number;
  remainingKobo: number;
}

/**
 * Light low-wallet banner above the KPI row: a white Mist-framed card with a
 * gold-tinted wallet chip, a two-line message (title, then the balance), and
 * the overview's only funding CTA as a primary button. It renders solely at
 * or past LOW_BALANCE_THRESHOLD, the same line the attention flag uses, so
 * billing stays the funding home the rest of the time. Amounts are
 * backend-computed, display only.
 */
export function WalletBanner({ spendKobo, remainingKobo }: WalletBannerProps) {
  const share = budgetUtilization(spendKobo, remainingKobo);
  if (share === null || share < LOW_BALANCE_THRESHOLD) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-card border border-mist bg-white px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="shrink-0 rounded-lg bg-gold/10 p-2 text-gold" aria-hidden="true">
          <Icon name="billing" size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">Wallet running low</p>
          <p className="mt-0.5 text-sm text-ink">
            <strong className="font-semibold">{formatKobo(remainingKobo)} remaining</strong>{" "}
            <span className="text-muted">({formatShare(share)} used).</span> Top up to keep your
            campaigns delivering.
          </p>
        </div>
      </div>
      <a
        href="/business/billing"
        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-naija px-4 text-sm font-semibold text-white transition-colors hover:bg-pine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naija sm:w-auto"
      >
        Top up wallet
      </a>
    </div>
  );
}
