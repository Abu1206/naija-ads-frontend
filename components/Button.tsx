import type { ButtonHTMLAttributes, ReactNode } from "react";

// One button set for the whole app (design-system.md): 44px minimum height,
// 8px radius. Primary is green, secondary is white with a green outline, gold
// only ever sits next to money, destructive is outlined red and never filled,
// cancel is plain text.
type ButtonVariant = "primary" | "secondary" | "gold" | "danger-outline" | "ghost";

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-naija text-white hover:bg-pine",
  secondary: "border border-naija bg-white text-pine hover:bg-mint",
  gold: "bg-gold text-ink hover:brightness-95",
  "danger-outline": "border border-alert bg-white text-alert hover:bg-blush",
  ghost: "text-muted hover:text-ink",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export function Button({ variant = "primary", children, className = "", ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_STYLES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
