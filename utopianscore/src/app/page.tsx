import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

const roleHome: Record<string, string> = {
  STUDENT: "/student/dashboard",
  FACULTY: "/faculty/dashboard",
  ADMIN: "/admin/dashboard",
};

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(roleHome[user.role] ?? "/student/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight text-ink-900">
          UtopianScore
        </h1>
        <p className="text-ink-500">
          Learn, practice, and build — in one calm workspace.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/login">
          <Button variant="primary">Sign in</Button>
        </Link>
        <Link href="/register">
          <Button variant="ghost">Create an account</Button>
        </Link>
      </div>
    </main>
  );
}
