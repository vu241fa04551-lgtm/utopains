import { clsx } from "@/lib/clsx";
import type { ActionResult } from "@/lib/action-result";

// A real, server-verified result — never shown unless the server
// actually returned it. No setTimeout, no optimistic fake success.
export function FeedbackBanner({ result }: { result: ActionResult | null }) {
  if (!result || !result.message) return null;

  return (
    <p
      role={result.ok ? "status" : "alert"}
      className={clsx(
        "mt-2 text-sm",
        result.ok ? "text-emerald-700" : "text-red-600"
      )}
    >
      {result.message}
    </p>
  );
}
