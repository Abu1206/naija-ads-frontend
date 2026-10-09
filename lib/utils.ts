// Minimal classnames joiner for shadcn-style `ui/` primitives.
// Deliberately dependency-free (no clsx/tailwind-merge) — one call site each.
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}
