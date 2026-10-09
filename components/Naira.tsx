/**
 * A pre-formatted naira string (from `formatKobo`) with the ₦ glyph set in the
 * body stack while digits keep the surrounding display face. The body stack
 * is the one rendering path proven to draw ₦ cleanly on-device; neither
 * display nor body primary font can be trusted with it alone. Non-naira
 * strings pass through untouched, so callers never branch.
 */
export function Naira({ value }: { value: string }) {
  if (!value.startsWith("₦")) return <>{value}</>;
  return (
    <>
      <span className="font-sans">₦</span>
      {value.slice(1)}
    </>
  );
}
