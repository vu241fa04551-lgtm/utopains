import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Role } from "@prisma/client";

export default async function FacultyPracticeListPage() {
  const user = await requireRole([Role.FACULTY, Role.ADMIN]);

  const problems = await prisma.practiceProblem.findMany({
    where: { createdById: user.id },
    include: { attempts: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Practice problems</h1>
          <p className="text-sm text-ink-500">Questions and coding problems you've authored.</p>
        </div>
        <Link href="/faculty/practice/new">
          <Button>New problem</Button>
        </Link>
      </header>

      {problems.length === 0 ? (
        <EmptyState
          title="No practice problems yet"
          description="Create your first MCQ or coding problem."
          action={
            <Link href="/faculty/practice/new">
              <Button>Create a problem</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {problems.map((p) => {
            const solvedCount = new Set(
              p.attempts.filter((a) => a.outcome === "CORRECT").map((a) => a.userId)
            ).size;
            return (
              <Card key={p.id}>
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-ink-900">{p.title}</h3>
                  <Badge tone={p.published ? "success" : "neutral"}>
                    {p.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="mt-2 flex gap-2">
                  <Badge tone="neutral">{p.difficulty}</Badge>
                  <Badge tone="advanced">{p.type}</Badge>
                </div>
                <p className="mt-2 text-xs text-ink-500">
                  {p.attempts.length} attempts · {solvedCount} students solved
                </p>
                <Link
                  href={`/faculty/practice/${p.id}`}
                  className="mt-3 inline-block text-sm font-medium text-brand-blue-dark"
                >
                  Manage →
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
