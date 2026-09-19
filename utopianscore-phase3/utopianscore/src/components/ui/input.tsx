import { type InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "@/lib/clsx";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        "w-full rounded-xl border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-brand-blue-dark focus:ring-2 focus:ring-brand-blue",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
