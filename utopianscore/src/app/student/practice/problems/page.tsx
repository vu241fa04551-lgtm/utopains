import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Role, Prisma, PracticeDifficulty, PracticeType } from "@prisma/client";

const difficulties: Array<PracticeDifficulty | "ALL"> = ["ALL", "EASY", "MEDIUM", "HARD"];
const types: Array<PracticeType | "ALL"> = ["ALL", "MCQ", "CODING"];

export default async function PracticeCatalogPage({
  searchParams,
}: {
  searchParams: { q?: string; difficulty?: string; type?: string };
}) {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);
  const query = searchParams.q?.trim() ?? "";
  const difficulty =
    searchParams.difficulty &&
    (Object.values(PracticeDifficulty) as string[]).includes(searchParams.difficulty)
      ? (searchParams.difficulty as PracticeDifficulty)
      : undefined;
  const type =
    searchParams.type && (Object.values(PracticeType) as string[]).includes(searchParams.type)
      ? (searchParams.type as PracticeType)
      : undefined;

  const where: Prisma.PracticeProblemWhereInput = {
    published: true,
    ...(difficulty ? { difficulty } : {}),
    ...(type ? { type } : {}),
    ...(query ? { title: { contains: query, mode: "insensitive" } } : {}),
  };

  const problems = await prisma.practiceProblem.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const myAttempts = await prisma.problemAttempt.findMany({
    where: { userId: user.id, outcome: "CORRECT" },
    select: { problemId: true },
  });
  const solvedIds = new Set(myAttempts.map((a) => a.problemId));

  function filterHref(nextDifficulty: typeof difficulty | "ALL", nextType: typeof type | "ALL") {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (nextDifficulty && nextDifficulty !== "ALL") params.set("difficulty", nextDifficulty);
    if (nextType && nextType !== "ALL") params.set("type", nextType);
    const qs = params.toString();
    return qs ? `/student/practice/problems?${qs}` : "/student/practice/problems";
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900">All problems</h1>
        <p className="text-sm text-ink-500">{problems.length} matching problems</p>
      </header>

      <form method="GET" className="flex gap-2">
        {difficulty && <input type="hidden" name="difficulty" value={difficulty} />}
        {type && <input type="hidden" name="type" value={type} />}
        <Input type="search" name="q" defaultValue={query} placeholder="Search problems…" />
        <Button type="submit" variant="ghost">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {difficulties.map((d) => (
          <Link key={d} href={filterHref(d === "ALL" ? undefined : d, type ?? "ALL")}>
            <Button variant={(difficulty ?? "ALL") === d ? "primary" : "ghost"}>
              {d === "ALL" ? "All difficulties" : d}
            </Button>
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <Link key={t} href={filterHref(difficulty ?? "ALL", t === "ALL" ? undefined : t)}>
            <Button variant={(type ?? "ALL") === t ? "secondary" : "ghost"}>
              {t === "ALL" ? "All types" : t}
            </Button>
          </Link>
        ))}
      </div>

      {problems.length === 0 ? (
        <EmptyState
          title="No problems match these filters"
          description="Try a different search term, difficulty, or type."
          action={
            <Link href="/student/practice/problems">
              <Button variant="ghost">Clear filters</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {problems.map((p) => (
            <Card key={p.id}>
              <div className="flex items-start justify-between">
                <h3 className="font-medium text-ink-900">{p.title}</h3>
                {solvedIds.has(p.id) && <Badge tone="success">Solved</Badge>}
              </div>
              <div className="mt-2 flex gap-2">
                <Badge tone="neutral">{p.difficulty}</Badge>
                <Badge tone="advanced">{p.type}</Badge>
              </div>
              <Link
                href={`/student/practice/problems/${p.slug}`}
                className="mt-3 inline-block text-sm font-medium text-brand-blue-dark"
              >
                Open →
              </Link>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
