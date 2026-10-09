import { budgetUtilization, formatKobo, formatShare } from "@/lib/format";
import { Naira } from "./Naira";

/**
 * Wallet context for the Remaining hero card: spent amount plus a
 * utilization bar. Amounts arrive backend-computed in kobo (AGENTS.md §6.1);
 * the bar fill is the same display-only fraction as everywhere else. The hero
 * itself (Remaining, gold) lives in the MetricCard value — this footer only
 * carries the secondary spent line and the bar. Funding lives on
 * /business/billing (WalletCard + FundForm), not in this KPI tile.
 */
export function SpendFooter({
  spendKobo,
  remainingKobo,
}: {
  spendKobo: number;
  remainingKobo: number;
}) {
  const share = budgetUtilization(spendKobo, remainingKobo);
  return (
    <div className="mt-2 border-t border-white/10 pt-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-semibold text-white">
          <Naira value={formatKobo(spendKobo)} />{" "}
          <span className="font-normal text-mint/70">spent</span>
        </span>
        <span className="text-xs whitespace-nowrap text-mint/70">
          {share === null ? "—" : `${formatShare(share)} used`}
        </span>
      </div>
      <div
        className="mt-1.5 h-1 rounded-full bg-white/10"
        role="progressbar"
        aria-label="Budget used"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={share === null ? 0 : Math.round(share * 1000) / 10}
      >
        <div
          className="h-full rounded-full bg-gold"
          style={{ width: `${share === null ? 0 : share * 100}%` }}
        />
      </div>
    </div>
  );
}
