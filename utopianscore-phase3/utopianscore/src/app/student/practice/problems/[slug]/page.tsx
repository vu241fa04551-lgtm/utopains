import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { McqForm } from "@/components/practice/mcq-form";
import { CodingSaveForm } from "@/components/practice/coding-save-form";
import { Role } from "@prisma/client";

export default async function PracticeProblemPage({
  params,
}: {
  params: { slug: string };
}) {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);

  const problem = await prisma.practiceProblem.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      title: true,
      description: true,
      difficulty: true,
      type: true,
      published: true,
      explanation: true,
      starterCode: true,
      constraints: true,
      examples: true,
      skills: { select: { name: true } },
      // SECURITY: isCorrect is deliberately never selected here — the
      // client never receives which option is correct.
      options: { select: { id: true, text: true }, orderBy: { order: "asc" } },
      // SECURITY: hidden test cases are excluded at the query level,
      // not filtered client-side.
      testCases: {
        where: { isHidden: false },
        select: { input: true, expectedOutput: true },
        orderBy: { order: "asc" },
      },
    },
  });
  if (!problem || !problem.published) notFound();

  const myAttempts = await prisma.problemAttempt.findMany({
    where: { userId: user.id, problemId: problem.id },
    orderBy: { createdAt: "desc" },
  });
  const hasCorrectAttempt = myAttempts.some((a) => a.outcome === "CORRECT");
  const hasAnyAttempt = myAttempts.length > 0;
  const showExplanation = problem.explanation && hasAnyAttempt;

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-6 py-10">
      <header>
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral">{problem.difficulty}</Badge>
          <Badge tone="advanced">{problem.type}</Badge>
          {hasCorrectAttempt && <Badge tone="success">Solved</Badge>}
          {problem.skills.map((s) => (
            <Badge key={s.name}>{s.name}</Badge>
          ))}
        </div>
        <h1 className="mt-3 text-2xl font-semibold text-ink-900">{problem.title}</h1>
      </header>

      <Card>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
          {problem.description}
        </p>
      </Card>

      {problem.type === "CODING" && (
        <>
          {problem.examples && (
            <Card>
              <h2 className="text-sm font-semibold text-ink-700">Examples</h2>
              <p className="mt-2 whitespace-pre-wrap font-mono text-sm text-ink-700">
                {problem.examples}
              </p>
            </Card>
          )}
          {problem.constraints && (
            <Card>
              <h2 className="text-sm font-semibold text-ink-700">Constraints</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink-700">
                {problem.constraints}
              </p>
            </Card>
          )}
          {problem.testCases.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-ink-700">Sample test cases</h2>
              <ul className="mt-2 space-y-2 text-sm">
                {problem.testCases.map((tc, i) => (
                  <li key={i} className="rounded-lg border border-ink-100 px-3 py-2 font-mono text-xs">
                    input: {tc.input} → output: {tc.expectedOutput}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <CodingSaveForm problemId={problem.id} starterCode={problem.starterCode} />
        </>
      )}

      {problem.type === "MCQ" &&
        (hasCorrectAttempt ? (
          <Card>
            <p className="text-sm font-medium text-emerald-700">
              You've already answered this correctly.
            </p>
          </Card>
        ) : (
          <McqForm problemId={problem.id} options={problem.options} />
        ))}

      {showExplanation && (
        <Card>
          <h2 className="text-sm font-semibold text-ink-700">Explanation</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink-700">
            {problem.explanation}
          </p>
        </Card>
      )}
    </main>
  );
}
