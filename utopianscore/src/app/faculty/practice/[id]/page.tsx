import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProblemPublishToggle } from "@/components/practice/problem-publish-toggle";
import { AddOptionForm } from "@/components/practice/add-option-form";
import { AddTestCaseForm } from "@/components/practice/add-test-case-form";
import { CodingContentForm } from "@/components/practice/coding-content-form";
import { ExplanationForm } from "@/components/practice/explanation-form";
import { Role } from "@prisma/client";

export default async function ManagePracticeProblemPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireRole([Role.FACULTY, Role.ADMIN]);

  const problem = await prisma.practiceProblem.findUnique({
    where: { id: params.id },
    include: {
      options: { orderBy: { order: "asc" } },
      testCases: { orderBy: { order: "asc" } },
    },
  });
  if (!problem) notFound();
  if (problem.createdById !== user.id && user.role !== Role.ADMIN) notFound();

  const isMcqPublishable = problem.type === "MCQ" && problem.options.some((o) => o.isCorrect);

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">{problem.title}</h1>
          <p className="mt-1 text-sm text-ink-500">{problem.description}</p>
          <div className="mt-2 flex gap-2">
            <Badge tone="neutral">{problem.difficulty}</Badge>
            <Badge tone="advanced">{problem.type}</Badge>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge tone={problem.published ? "success" : "neutral"}>
            {problem.published ? "Published" : "Draft"}
          </Badge>
          <ProblemPublishToggle problemId={problem.id} published={problem.published} />
        </div>
      </header>

      {problem.type === "MCQ" && (
        <>
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-ink-700">Options</h2>
            {problem.options.length === 0 && (
              <p className="mb-3 text-sm text-ink-500">No options yet.</p>
            )}
            <ul className="mb-4 space-y-2">
              {problem.options.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2 text-sm"
                >
                  <span className="text-ink-900">{o.text}</span>
                  {o.isCorrect && <Badge tone="success">Correct</Badge>}
                </li>
              ))}
            </ul>
            <AddOptionForm problemId={problem.id} />
            {!isMcqPublishable && (
              <p className="mt-3 text-xs text-brand-orange-dark">
                Mark at least one option as correct before publishing.
              </p>
            )}
          </Card>
        </>
      )}

      {problem.type === "CODING" && (
        <>
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-ink-700">
              Content (description, starter code, examples)
            </h2>
            <CodingContentForm
              problemId={problem.id}
              starterCode={problem.starterCode}
              constraints={problem.constraints}
              examples={problem.examples}
            />
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-ink-700">Test cases</h2>
            {problem.testCases.length === 0 && (
              <p className="mb-3 text-sm text-ink-500">No test cases yet.</p>
            )}
            <ul className="mb-4 space-y-2">
              {problem.testCases.map((tc) => (
                <li
                  key={tc.id}
                  className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2 font-mono text-xs"
                >
                  <span>
                    in: {tc.input} → out: {tc.expectedOutput}
                  </span>
                  {tc.isHidden && <Badge tone="neutral">Hidden</Badge>}
                </li>
              ))}
            </ul>
            <AddTestCaseForm problemId={problem.id} />
            <p className="mt-3 text-xs text-ink-500">
              Stored for future automated grading — not executed yet in this environment.
            </p>
          </Card>
        </>
      )}

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-ink-700">Explanation (shown after attempt)</h2>
        <ExplanationForm problemId={problem.id} explanation={problem.explanation} />
      </Card>
    </main>
  );
}
