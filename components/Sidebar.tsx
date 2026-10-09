"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, MotionConfig, motion, type Transition } from "motion/react";
import { Icon } from "./Icon";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Motion language adapted from Animate UI's radix sidebar
// (@animate-ui/components-radix-sidebar) — deliberately the animations only,
// not the component: the rail keeps our tokens and rim-bar design.
//
// The fold is one curve, not a choreography: rail width, wordmark, labels and
// the toggle all transition over the same duration with the same easing (their
// container curve), so nothing drifts out of sync mid-fold. Per-item
// AnimatePresence exits and `layout` springs were removed — they measured
// different mid-fold layouts and fought the width transition, which is what
// made collapsing feel buggy.
//
// Framer stays only for what is pointer-driven rather than fold-driven: the
// rim bar glides between rows on their spring, and the hover wash is the
// parent-mode Highlight from the subzero project — ONE element re-targeting
// measured bounds (inset 12px per side expanded, a 44px square centered in
// the rail when collapsed) with a 200ms exit delay so it fades out unhurried
// instead of snapping off. Per-row pills were tried first: with nothing
// continuous to animate, they pop in and out.
const RAIL_EASING = "ease-[cubic-bezier(0.75,0,0.25,1)]";
const SIDEBAR_SPRING: Transition = { type: "spring", stiffness: 350, damping: 35 };

/**
 * Dashboard navigation (design-system.md): the rail blends into the app
 * background (Cloud) and is separated from the content by a Mist border. The
 * active item speaks in Pine with a thin Naija rim bar that glides to the
 * newly active row; hovered (or keyboard-focused) rows lift on a mint wash
 * scoped to the row that follows the pointer. No pills, no captions — the
 * rim bar is the only permanent marker. On phones the rail becomes a
 * horizontal strip; on desktop the toggle folds the rail to icons, with the
 * wordmark, labels and toggle riding the same curve as the width.
 */
export function Sidebar({ section, items }: { section: string; items: NavItem[] }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  // The toggle only exists on desktop: a fold-then-resize must never strand
  // the phone strip without labels.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const reset = () => {
      if (mq.matches) setCollapsed(false);
    };
    reset();
    mq.addEventListener("change", reset);
    return () => mq.removeEventListener("change", reset);
  }, []);
  // Deepest matching href wins so a role's overview does not light up everywhere.
  const activeHref = items
    .filter((item) => isActive(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  // Hover wash (see the Highlight note above): measure the hovered row against
  // the nav container and animate one element to those bounds.
  const navRef = useRef<HTMLElement | null>(null);
  const rowRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [wash, setWash] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const measure = useCallback(
    (href: string) => {
      const nav = navRef.current;
      const row = rowRefs.current.get(href);
      if (!nav || !row) return;
      const n = nav.getBoundingClientRect();
      const r = row.getBoundingClientRect();
      const next = {
        top: r.top - n.top + nav.scrollTop,
        left: r.left - n.left + (collapsed ? 16 : 12),
        width: r.width + (collapsed ? -32 : -24),
        height: r.height,
      };
      // Skip identical bounds so the rAF loop does not re-render every frame.
      setWash((prev) =>
        prev &&
        prev.top === next.top &&
        prev.left === next.left &&
        prev.width === next.width &&
        prev.height === next.height
          ? prev
          : next,
      );
    },
    [collapsed],
  );

  // One hover source of truth, exactly like their activeValue: the effect sets
  // bounds while something is hovered and clears them only when NOTHING is.
  // The `!hovered` clear is what fires the 200ms delayed exit fade — and
  // because it is an effect, gliding A→B (leave then enter in the same task)
  // never passes through a cleared state, so the wash glides instead of
  // blinking out and in.
  useEffect(() => {
    if (!hovered) {
      setWash(null);
      return;
    }
    // rAF keeps the bounds live through the rail fold, an internal scroll and
    // a resize without a listener for each (their forceUpdateBounds).
    let raf = requestAnimationFrame(function tick() {
      measure(hovered);
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [hovered, measure]);

  return (
    <MotionConfig reducedMotion="user">
      <aside
        className={`w-full shrink-0 border-mist bg-cloud transition-[width] duration-400 motion-reduce:transition-none ${RAIL_EASING} not-md:border-b md:sticky md:top-0 md:flex md:h-svh md:flex-col md:border-r ${
          collapsed ? "md:w-[76px]" : "md:w-60"
        }`}
      >
        <div className="relative flex items-center pr-2 pl-5 py-5">
          {/* The wordmark collapses its own width instead of unmounting: an exit
              animation keeps layout space for ~150ms after the rail has already
              started folding, which strands the toggle mid-flight. */}
          <span
            className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-400 motion-reduce:transition-none ${RAIL_EASING} ${
              collapsed ? "md:max-w-0 md:opacity-0" : "md:max-w-[160px]"
            }`}
          >
            <Link
              href="/"
              className="font-display text-lg font-bold tracking-tight text-ink transition-colors duration-150 ease hover:text-pine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naija"
            >
              naija<span className="text-naija">ads</span>
            </Link>
          </span>
          {/* Absolutely positioned so the fold is a single `right` transition on
              the same curve as the rail width — no layout measurement, no
              spring racing the width easing. Hover stays fast (150ms) while the
              position fold stays 400ms: one arbitrary transition, two timings. */}
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`absolute top-1/2 hidden min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-[right_400ms_cubic-bezier(0.75,0,0.25,1),background-color_150ms,color_150ms] ease hover:bg-mint hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naija md:inline-flex motion-reduce:transition-none ${
              collapsed ? "right-[calc(50%-22px)]" : "right-2"
            }`}
          >
            <Icon name="collapse" className={`transition-transform duration-200 ease-out ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
        <nav
          ref={navRef}
          aria-label={section}
          className="relative pt-1 pb-4 md:flex-1 md:overflow-y-auto md:pb-6"
        >
          {/* The one wash: re-targets bounds between rows, exits 200ms late. */}
          <AnimatePresence initial={false} mode="wait">
            {wash && (
              <motion.div
                aria-hidden="true"
                initial={{ ...wash, opacity: 0 }}
                animate={{ ...wash, opacity: 1 }}
                exit={{ opacity: 0, transition: { ...SIDEBAR_SPRING, delay: 0.2 } }}
                transition={SIDEBAR_SPRING}
                className="pointer-events-none absolute z-0 rounded-lg bg-mint"
              />
            )}
          </AnimatePresence>
          <ul className="flex gap-1 overflow-x-auto md:flex-col md:gap-2 md:overflow-visible">
            {items.map((item) => {
              const current = item.href === activeHref;
              return (
                <li key={item.href} className="shrink-0 md:shrink" title={collapsed ? item.label : undefined}>
                  <Link
                    href={item.href}
                    ref={(node) => {
                      if (node) rowRefs.current.set(item.href, node);
                      else rowRefs.current.delete(item.href);
                    }}
                    aria-current={current ? "page" : undefined}
                    onMouseEnter={() => setHovered(item.href)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(item.href)}
                    onBlur={() => setHovered(null)}
                    className={`relative flex min-h-[44px] items-center gap-3 px-5 py-2.5 text-[15px] whitespace-nowrap transition-colors duration-150 ease focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-naija ${
                      collapsed ? "md:justify-center md:gap-0 md:px-0" : ""
                    } ${
                      current
                        ? "font-semibold text-pine"
                        : "font-medium text-muted hover:text-ink"
                    }`}
                  >
                    <Icon name={item.icon} className="relative z-10" />
                    {/* Labels fold their own width, in lockstep with the rail —
                        the header comment explains why unmount-based exits were
                        the bug. */}
                    <span
                      className={`relative z-10 flex flex-1 items-center gap-2 overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-400 motion-reduce:transition-none ${RAIL_EASING} ${
                        collapsed ? "md:max-w-0 md:opacity-0" : "md:max-w-[160px]"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="ml-auto rounded-full border border-mist bg-white px-2 py-0.5 text-xs font-medium text-muted">
                          {item.badge}
                        </span>
                      )}
                    </span>
                    {current && (
                      <motion.span
                        aria-hidden="true"
                        layoutId="sidebar-active-rim"
                        transition={SIDEBAR_SPRING}
                        className="absolute top-1/2 right-0 hidden h-6 w-[3px] -translate-y-1/2 rounded-l-full bg-naija md:block"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </MotionConfig>
  );
}
