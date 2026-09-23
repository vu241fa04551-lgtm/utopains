import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Role } from "@prisma/client";

const outcomeTone = {
  CORRECT: "success",
  INCORRECT: "neutral",
  UNGRADED: "progress",
} as const;

const outcomeLabel = {
  CORRECT: "Correct",
  INCORRECT: "Incorrect",
  UNGRADED: "Saved (not graded)",
} as const;

const PAGE_SIZE = 20;

export default async function PracticeHistoryPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);

  const [attempts, total] = await Promise.all([
    prisma.problemAttempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { problem: true },
    }),
    prisma.problemAttempt.count({ where: { userId: user.id } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900">Practice history</h1>
        <p className="text-sm text-ink-500">{total} total attempts</p>
      </header>

      {attempts.length === 0 ? (
        <EmptyState
          title="No attempts yet"
          description="Answer a question or save some code to start building history."
          action={
            <Link href="/student/practice/problems">
              <Button>Browse problems</Button>
            </Link>
          }
        />
      ) : (
        <>
          <Card className="divide-y divide-ink-100 p-0">
            {attempts.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <Link
                    href={`/student/practice/problems/${a.problem.slug}`}
                    className="text-sm font-medium text-ink-900 hover:text-brand-blue-dark"
                  >
                    {a.problem.title}
                  </Link>
                  <p className="text-xs text-ink-500">
                    {a.problem.type}
                    {a.language ? ` · ${a.language}` : ""} ·{" "}
                    {a.createdAt.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Badge tone={outcomeTone[a.outcome]}>{outcomeLabel[a.outcome]}</Badge>
              </div>
            ))}
          </Card>

          {totalPages > 1 && (
            <nav className="flex items-center justify-between text-sm">
              <Link
                href={`/student/practice/history?page=${Math.max(1, page - 1)}`}
                aria-disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none text-ink-300" : "text-brand-blue-dark"}
              >
                ← Newer
              </Link>
              <span className="text-ink-500">
                Page {page} of {totalPages}
              </span>
              <Link
                href={`/student/practice/history?page=${Math.min(totalPages, page + 1)}`}
                aria-disabled={page >= totalPages}
                className={
                  page >= totalPages ? "pointer-events-none text-ink-300" : "text-brand-blue-dark"
                }
              >
                Older →
              </Link>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
