"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { gradeMcqSelection } from "@/domain/practice";
import type { ActionResult } from "@/lib/action-result";

export async function submitMcqAttempt(
  problemId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "You need to sign in first." };

  const selectedOptionId = formData.get("optionId");
  if (typeof selectedOptionId !== "string" || !selectedOptionId) {
    return { ok: false, message: "Please choose an answer." };
  }

  const problem = await prisma.practiceProblem.findUnique({
    where: { id: problemId },
    include: { options: true },
  });
  if (!problem || !problem.published || problem.type !== "MCQ") {
    return { ok: false, message: "That question isn't available." };
  }

  // Grading happens here, server-side, against the full option list
  // (including isCorrect) — that list is never sent to the client
  // before this point.
  const outcome = gradeMcqSelection(problem.options, selectedOptionId);

  await prisma.problemAttempt.create({
    data: { userId: user.id, problemId, selectedOptionId, outcome },
  });

  revalidatePath(`/student/practice/problems/${problem.slug}`);
  revalidatePath("/student/practice");
  revalidatePath("/student/practice/history");

  return {
    ok: outcome === "CORRECT",
    message: outcome === "CORRECT" ? "Correct!" : "Not quite — see the explanation below.",
  };
}

export async function saveCodingAttempt(
  problemId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "You need to sign in first." };

  const sourceCode = formData.get("sourceCode");
  const language = formData.get("language");
  if (typeof sourceCode !== "string" || sourceCode.trim().length === 0) {
    return { ok: false, message: "Write some code before saving." };
  }
  if (sourceCode.length > 20000) {
    return { ok: false, message: "That's too long to save (20,000 character limit)." };
  }

  const problem = await prisma.practiceProblem.findUnique({ where: { id: problemId } });
  if (!problem || !problem.published || problem.type !== "CODING") {
    return { ok: false, message: "That problem isn't available." };
  }

  // Honest limitation: there is no sandboxed execution worker in this
  // environment, so this action can only persist the code — it
  // cannot run it or grade it. outcome is always UNGRADED here.
  await prisma.problemAttempt.create({
    data: {
      userId: user.id,
      problemId,
      sourceCode,
      language: typeof language === "string" ? language : "plaintext",
      outcome: "UNGRADED",
    },
  });

  revalidatePath(`/student/practice/problems/${problem.slug}`);
  revalidatePath("/student/practice");
  revalidatePath("/student/practice/history");

  return {
    ok: true,
    message: "Code saved to your account. (Running/grading isn't available yet.)",
  };
}
