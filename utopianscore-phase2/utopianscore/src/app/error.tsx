"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Root error boundary. Deliberately does not expose error.message
// verbatim to the user — that can leak internal details — but does
// log it for diagnosis, and gives a real retry action (reset()),
// not a dead-end screen.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-lg font-semibold text-ink-900">Something went wrong</h1>
      <p className="text-sm text-ink-500">
        We couldn't load this page. Your data is safe — please try again.
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </main>
  );
}
