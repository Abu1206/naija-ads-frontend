import type { ReactNode } from "react";

/**
 * The most recognisable object in the product (design-system.md): Deep Forest
 * card, small-caps label, balance in gold, main action below it.
 * The balance is always a pre-formatted string — money math lives server-side.
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
      className="rounded-wallet border border-forest bg-forest p-6"
    >
      <p className="text-xs font-bold tracking-wider text-mint/70 uppercase">{label}</p>
      <p className="mt-2 font-display font-display text-4xl font-bold text-ink tracking-tight text-gold">{balance}</p>
      {hint && <p className="mt-2 text-sm text-mint/70">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </section>
  );
}
