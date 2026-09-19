"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function enrollInCourse(courseId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated.");

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.published) {
    throw new Error("That course is not available for enrollment.");
  }

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    update: {},
    create: { userId: user.id, courseId },
  });

  revalidatePath("/student/dashboard");
  revalidatePath("/student/courses");
}

export async function completeLesson(lessonId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated.");

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson) throw new Error("Lesson not found.");

  // A student may only mark progress for a course they're enrolled in.
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId: user.id, courseId: lesson.module.course.id },
    },
  });
  if (!enrollment) {
    throw new Error("You must be enrolled in this course to track progress.");
  }

  await prisma.progress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: { completed: true, completedAt: new Date() },
    create: { userId: user.id, lessonId, completed: true, completedAt: new Date() },
  });

  revalidatePath(`/student/courses/${lesson.module.course.slug}`);
  revalidatePath(`/student/courses/${lesson.module.course.slug}/lessons/${lessonId}`);
  revalidatePath("/student/dashboard");
}
