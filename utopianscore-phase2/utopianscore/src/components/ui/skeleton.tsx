import { clsx } from "@/lib/clsx";

// Deliberately subtle — a single opacity pulse, not a shimmering
// animation, per the "avoid excessive skeleton animation" guidance.
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-xl bg-ink-100", className)} />;
}
