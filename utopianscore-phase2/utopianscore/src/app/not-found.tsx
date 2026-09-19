import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-lg font-semibold text-ink-900">Page not found</h1>
      <p className="text-sm text-ink-500">
        That page doesn't exist, or you don't have access to it.
      </p>
      <Link href="/">
        <Button>Go home</Button>
      </Link>
    </main>
  );
}
