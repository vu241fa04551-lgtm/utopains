"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Role } from "@prisma/client";
import type { ActionResult } from "@/lib/action-result";
import { slugify } from "@/domain/slug";

const courseSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(2000),
});

// Kept as a plain (non-useFormState) action: on success it redirects
// straight into the new course's authoring page, which is itself the
// confirmation — there's nothing useful to say in a banner first.
export async function createCourse(formData: FormData) {
  const user = await requireRole([Role.FACULTY, Role.ADMIN]);

  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    throw new Error("Please provide a title (3+ chars) and a description (10+ chars).");
  }

  const baseSlug = slugify(parsed.data.title);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const course = await prisma.course.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      slug,
      facultyId: user.id,
      published: false,
    },
  });

  revalidatePath("/faculty/courses");
  redirect(`/faculty/courses/${course.id}`);
}

async function assertOwnsCourse(courseId: string, userId: string, role: Role) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new Error("Course not found.");
  if (course.facultyId !== userId && role !== Role.ADMIN) {
    throw new Error("You do not have access to this course.");
  }
  return course;
}

export async function togglePublish(
  courseId: string,
  _prevState: ActionResult,
  _formData: FormData
): Promise<ActionResult> {
  const user = await requireRole([Role.FACULTY, Role.ADMIN]);
  const course = await assertOwnsCourse(courseId, user.id, user.role as Role);

  const nowPublished = !course.published;
  await prisma.course.update({ where: { id: courseId }, data: { published: nowPublished } });

  revalidatePath(`/faculty/courses/${courseId}`);
  revalidatePath("/faculty/courses");
  revalidatePath("/student/courses");

  return { ok: true, message: nowPublished ? "Course published." : "Course unpublished." };
}

const moduleSchema = z.object({
  title: z.string().trim().min(2).max(150),
});

export async function createModule(
  courseId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireRole([Role.FACULTY, Role.ADMIN]);
  await assertOwnsCourse(courseId, user.id, user.role as Role);

  const parsed = moduleSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) {
    return { ok: false, message: "Module title must be at least 2 characters." };
  }

  const count = await prisma.module.count({ where: { courseId } });
  await prisma.module.create({
    data: { title: parsed.data.title, courseId, order: count + 1 },
  });

  revalidatePath(`/faculty/courses/${courseId}`);
  return { ok: true, message: "Module added." };
}

const lessonSchema = z.object({
  title: z.string().trim().min(2).max(150),
  content: z.string().trim().min(10).max(20000),
});

export async function createLesson(
  courseId: string,
  moduleId: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireRole([Role.FACULTY, Role.ADMIN]);
  await assertOwnsCourse(courseId, user.id, user.role as Role);

  const parsed = lessonSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Lesson needs a title (2+ chars) and content (10+ chars)." };
  }

  const count = await prisma.lesson.count({ where: { moduleId } });
  await prisma.lesson.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      moduleId,
      order: count + 1,
    },
  });

  revalidatePath(`/faculty/courses/${courseId}`);
  return { ok: true, message: "Lesson added." };
}
