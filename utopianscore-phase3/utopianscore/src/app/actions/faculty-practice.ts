"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Role, PracticeDifficulty, PracticeType } from "@prisma/client";
import { slugify } from "@/domain/slug";
import type { ActionResult } from "@/lib/action-result";

const problemSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(4000),
  difficulty: z.nativeEnum(PracticeDifficulty),
  type: z.nativeEnum(PracticeType),
});

export async function createProblem(formData: FormData) {
  const user = await requireRole([Role.FACULTY, Role.ADMIN]);

  const parsed = problemSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    difficulty: formData.get("difficulty"),
    type: formData.get("type"),
  });
  if (!parsed.success) {
    throw new Error("Please fill in a valid title, description, difficulty, and type.");
  }

  const baseSlug = slugify(parsed.data.title);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.practiceProblem.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const problem = await prisma.practiceProblem.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      difficulty: parsed.data.difficulty,
      type: parsed.data.type,
      slug,
      createdById: user.id,
      published: false,
    },
  });

  revalidatePath("/faculty/practice");
  redirect(`/faculty/practice/${problem.id}`);
}

async function assertOwnsProblem(problemId: string, userId: string, role: Role) {
  const problem = await prisma.practiceProblem.findUnique({ where: { id: problemId } });
  if (!problem) throw new Error("Problem not found.");
  if (problem.createdById !== userId && role !== Role.ADMIN) {
    throw new Error("You do not have access to this problem.");
  }
  return problem;
}

export async function togglePublishProblem(
  problemId: string,
  _prevState: ActionResult,
  _formData: FormData
): Promise<ActionResult> {
  const user = await requireRole([Role.FACULTY, Role.ADMIN]);
  const problem = await assertOwnsProblem(problemId, user.id, user.role as Role);

  const nowPublished = !problem.published;
  await prisma.practiceProblem.update({
    where: { id: problemId },
    data: { published: nowPublished },
  });

  revalidatePath(`/faculty/practice/${problemId}`);
  revalidatePath("/faculty/practice");
  revalidatePath("/student/practice/problems");

  return { ok: true, message: nowPublished ? "Problem published." : "Problem unpublished." };
}

const optionSchema = z.object({
  text: z.string().trim().min(1).max(300),
  isCorrect: z.string().optional(),
});

export async function addOption(
  problemId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireRole([Role.FACULTY, Role.ADMIN]);
  const problem = await assertOwnsProblem(problemId, user.id, user.role as Role);
  if (problem.type !== "MCQ") return { ok: false, message: "This problem isn't an MCQ." };

  const parsed = optionSchema.safeParse({
    text: formData.get("text"),
    isCorrect: formData.get("isCorrect")?.toString(),
  });
  if (!parsed.success) return { ok: false, message: "Option text is required." };

  const count = await prisma.questionOption.count({ where: { problemId } });
  await prisma.questionOption.create({
    data: {
      problemId,
      text: parsed.data.text,
      isCorrect: parsed.data.isCorrect === "on",
      order: count + 1,
    },
  });

  revalidatePath(`/faculty/practice/${problemId}`);
  return { ok: true, message: "Option added." };
}

const testCaseSchema = z.object({
  input: z.string().trim().min(1).max(2000),
  expectedOutput: z.string().trim().min(1).max(2000),
  isHidden: z.string().optional(),
});

export async function addTestCase(
  problemId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireRole([Role.FACULTY, Role.ADMIN]);
  const problem = await assertOwnsProblem(problemId, user.id, user.role as Role);
  if (problem.type !== "CODING") return { ok: false, message: "This problem isn't a coding problem." };

  const parsed = testCaseSchema.safeParse({
    input: formData.get("input"),
    expectedOutput: formData.get("expectedOutput"),
    isHidden: formData.get("isHidden")?.toString(),
  });
  if (!parsed.success) return { ok: false, message: "Input and expected output are required." };

  const count = await prisma.testCase.count({ where: { problemId } });
  await prisma.testCase.create({
    data: {
      problemId,
      input: parsed.data.input,
      expectedOutput: parsed.data.expectedOutput,
      isHidden: parsed.data.isHidden === "on",
      order: count + 1,
    },
  });

  revalidatePath(`/faculty/practice/${problemId}`);
  return {
    ok: true,
    message: "Test case saved. (It's stored for future execution support — not run yet.)",
  };
}

const codingContentSchema = z.object({
  starterCode: z.string().max(10000).optional(),
  constraints: z.string().max(2000).optional(),
  examples: z.string().max(2000).optional(),
});

export async function updateCodingContent(
  problemId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireRole([Role.FACULTY, Role.ADMIN]);
  const problem = await assertOwnsProblem(problemId, user.id, user.role as Role);
  if (problem.type !== "CODING") return { ok: false, message: "This problem isn't a coding problem." };

  const parsed = codingContentSchema.safeParse({
    starterCode: formData.get("starterCode")?.toString(),
    constraints: formData.get("constraints")?.toString(),
    examples: formData.get("examples")?.toString(),
  });
  if (!parsed.success) return { ok: false, message: "Could not save — check the fields." };

  await prisma.practiceProblem.update({
    where: { id: problemId },
    data: {
      starterCode: parsed.data.starterCode || null,
      constraints: parsed.data.constraints || null,
      examples: parsed.data.examples || null,
    },
  });

  revalidatePath(`/faculty/practice/${problemId}`);
  return { ok: true, message: "Saved." };
}

const explanationSchema = z.object({
  explanation: z.string().trim().max(4000).optional(),
});

export async function updateExplanation(
  problemId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireRole([Role.FACULTY, Role.ADMIN]);
  await assertOwnsProblem(problemId, user.id, user.role as Role);

  const parsed = explanationSchema.safeParse({
    explanation: formData.get("explanation")?.toString(),
  });
  if (!parsed.success) return { ok: false, message: "Could not save the explanation." };

  await prisma.practiceProblem.update({
    where: { id: problemId },
    data: { explanation: parsed.data.explanation || null },
  });

  revalidatePath(`/faculty/practice/${problemId}`);
  return { ok: true, message: "Explanation saved." };
}
