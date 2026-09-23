"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import type { ActionResult } from "@/lib/action-result";

export async function enrollInCourse(
  courseId: string,
  _prevState: ActionResult,
  _formData: FormData
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "You need to sign in first." };

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.published) {
    return { ok: false, message: "That course is not available for enrollment." };
  }

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    update: {},
    create: { userId: user.id, courseId },
  });

  revalidatePath("/student/dashboard");
  revalidatePath("/student/courses");
  revalidatePath(`/student/courses/${course.slug}`);

  return { ok: true, message: "You're enrolled." };
}

export async function completeLesson(
  lessonId: string,
  _prevState: ActionResult,
  _formData: FormData
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "You need to sign in first." };

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson) return { ok: false, message: "Lesson not found." };

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId: user.id, courseId: lesson.module.course.id },
    },
  });
  if (!enrollment) {
    return { ok: false, message: "You must be enrolled in this course to track progress." };
  }

  await prisma.progress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: { completed: true, completedAt: new Date() },
    create: { userId: user.id, lessonId, completed: true, completedAt: new Date() },
  });

  revalidatePath(`/student/courses/${lesson.module.course.slug}`);
  revalidatePath(`/student/courses/${lesson.module.course.slug}/lessons/${lessonId}`);
  revalidatePath("/student/dashboard");
  revalidatePath("/student/progress");

  return { ok: true, message: "Lesson marked complete." };
}
