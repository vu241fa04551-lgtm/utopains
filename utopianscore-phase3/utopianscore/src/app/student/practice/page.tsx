import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { calculatePracticeStats } from "@/domain/practice";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Role } from "@prisma/client";

export default async function PracticeDashboardPage() {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);

  const attempts = await prisma.problemAttempt.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { problem: true },
  });

  const stats = calculatePracticeStats(attempts);

  // "Continue practice": the most recently attempted problem that
  // isn't yet solved (real data — the most recent CORRECT attempt for
  // a problem removes it from this list on the next query).
  const solvedProblemIds = new Set(
    attempts.filter((a) => a.outcome === "CORRECT").map((a) => a.problemId)
  );
  const continueAttempt = attempts.find((a) => !solvedProblemIds.has(a.problemId));

  // "Recommended": published problems with no attempt from this user
  // yet, easiest first — a deterministic rule, not a claimed AI
  // recommendation.
  const attemptedIds = new Set(attempts.map((a) => a.problemId));
  const recommended = await prisma.practiceProblem.findMany({
    where: { published: true, id: { notIn: Array.from(attemptedIds) } },
    orderBy: [{ difficulty: "asc" }, { createdAt: "asc" }],
    take: 3,
  });

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900">Practice</h1>
        <p className="text-sm text-ink-500">Reinforce what you're learning.</p>
      </header>

      {continueAttempt && (
        <Card>
          <Badge tone="progress">Continue practice</Badge>
          <h2 className="mt-2 text-lg font-semibold text-ink-900">
            {continueAttempt.problem.title}
          </h2>
          <div className="mt-3">
            <Link href={`/student/practice/problems/${continueAttempt.problem.slug}`}>
              <Button>Continue</Button>
            </Link>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-semibold text-ink-900">{stats.attempted}</p>
          <p className="mt-1 text-xs text-ink-500">Problems attempted</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-semibold text-ink-900">{stats.solved}</p>
          <p className="mt-1 text-xs text-ink-500">Problems solved</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-semibold text-ink-900">{stats.accuracy}%</p>
          <p className="mt-1 text-xs text-ink-500">MCQ accuracy</p>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink-700">Recommended next</h2>
        {recommended.length === 0 ? (
          <EmptyState
            title="You're caught up"
            description="No new published problems right now — check back soon, or browse everything."
            action={
              <Link href="/student/practice/problems">
                <Button variant="ghost">Browse all problems</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {recommended.map((p) => (
              <Card key={p.id}>
                <Badge tone="neutral">{p.difficulty}</Badge>
                <h3 className="mt-2 text-sm font-medium text-ink-900">{p.title}</h3>
                <Link
                  href={`/student/practice/problems/${p.slug}`}
                  className="mt-2 inline-block text-sm font-medium text-brand-blue-dark"
                >
                  Start →
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      <div className="flex gap-4 text-sm">
        <Link href="/student/practice/problems" className="font-medium text-brand-blue-dark">
          Browse all problems →
        </Link>
        <Link href="/student/practice/history" className="font-medium text-brand-blue-dark">
          View history →
        </Link>
      </div>
    </main>
  );
}
