import type { HTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";

type Tone = "neutral" | "success" | "progress" | "advanced";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-ink-100 text-ink-700",
  success: "bg-emerald-100 text-emerald-700",
  progress: "bg-brand-orange/30 text-brand-orange-dark",
  advanced: "bg-brand-violet/20 text-brand-violet-dark",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
