import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/session";

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
    <main className="min-h-screen bg-brand-blue/30">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
          One place to learn, practice, and build.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-ink-500">
          UtopianScore brings courses, lessons, and progress tracking together
          in a calm, focused workspace — for students and the faculty who
          teach them.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/register">
            <Button>Start learning</Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
        </div>
      </section>

      {/* Learning experience */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <h3 className="font-medium text-ink-900">Structured courses</h3>
            <p className="mt-2 text-sm text-ink-500">
              Courses are organized into modules and lessons, so it's always
              clear what to learn next.
            </p>
          </Card>
          <Card>
            <h3 className="font-medium text-ink-900">Real progress</h3>
            <p className="mt-2 text-sm text-ink-500">
              Every completed lesson updates your progress immediately —
              nothing is simulated.
            </p>
          </Card>
          <Card>
            <h3 className="font-medium text-ink-900">One workspace</h3>
            <p className="mt-2 text-sm text-ink-500">
              Learning and teaching live in the same product, not scattered
              across separate tools.
            </p>
          </Card>
        </div>
      </section>

      {/* For students / for faculty */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <h2 className="text-lg font-semibold text-ink-900">For students</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-500">
              <li>Browse published courses and enroll instantly.</li>
              <li>Work through lessons at your own pace.</li>
              <li>See exactly what you've completed and what's next.</li>
            </ul>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold text-ink-900">For faculty</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-500">
              <li>Create a course and structure it into modules and lessons.</li>
              <li>Publish when it's ready — drafts stay private until then.</li>
              <li>See real enrollment and progress on your own dashboard.</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="text-2xl font-semibold text-ink-900">Ready to get started?</h2>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/register">
            <Button>Create an account</Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
