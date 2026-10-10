import type { ReactNode } from "react";
import { Naira } from "./Naira";

/**
 * The most recognisable object in the product (design-system.md): Deep Forest
 * card, small-caps label, balance in gold, main action below it. The balance is
 * always a pre-formatted string — money math lives server-side.
 *
 * Two zones, number on top and hint/action pinned to the bottom: in a pair of
 * cards with `items-stretch`, the hint lines land on one baseline instead of
 * the second card showing a slab of empty green.
 */
export function WalletCard({
  label,
  balance,
  hint,
  action,
}: {
  label: string;
  balance: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <section
      aria-label={`${label}: ${balance}`}
      className="flex h-full flex-col justify-between gap-5 rounded-wallet border border-forest bg-forest p-5"
    >
      <div>
        <p className="text-xs font-bold tracking-wider text-mint/70 uppercase">{label}</p>
        <p className="mt-2 font-display text-4xl font-bold tracking-tight text-gold">
          <Naira value={balance} />
        </p>
      </div>
      {(hint || action) && (
        <div className="space-y-3">
          {hint && <p className="text-sm text-mint/70">{hint}</p>}
          {action}
        </div>
      )}
    </section>
  );
}
