import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompleteLessonButton } from "@/components/lessons/complete-lesson-button";
import { Role } from "@prisma/client";

export default async function LessonPage({
  params,
}: {
  params: { slug: string; lessonId: string };
}) {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      module: {
        include: {
          course: true,
          lessons: { orderBy: { order: "asc" } },
        },
      },
    },
  });
  if (!lesson || lesson.module.course.slug !== params.slug) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId: user.id, courseId: lesson.module.course.id },
    },
  });
  if (!enrollment) notFound();

  const progress = await prisma.progress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
  });

  // Previous/next within the same module — a simple, honest ordering
  // aid. Cross-module sequencing is a Phase 3 concern.
  const siblingLessons = lesson.module.lessons;
  const currentIndex = siblingLessons.findIndex((l) => l.id === lesson.id);
  const previousLesson = currentIndex > 0 ? siblingLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < siblingLessons.length - 1
      ? siblingLessons[currentIndex + 1]
      : null;

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-6 py-10">
      <div className="space-y-1">
        <Link
          href={`/student/courses/${params.slug}`}
          className="text-sm text-ink-500 hover:text-ink-900"
        >
          ← Back to {lesson.module.course.title}
        </Link>
        <p className="text-xs uppercase tracking-wide text-ink-500">{lesson.module.title}</p>
      </div>

      <header className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-ink-900">{lesson.title}</h1>
        {progress?.completed && <Badge tone="success">Completed</Badge>}
      </header>

      <Card>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
          {lesson.content}
        </p>
      </Card>

      {!progress?.completed && <CompleteLessonButton lessonId={lesson.id} />}

      <nav className="flex items-center justify-between border-t border-ink-100 pt-4 text-sm">
        {previousLesson ? (
          <Link
            href={`/student/courses/${params.slug}/lessons/${previousLesson.id}`}
            className="font-medium text-brand-blue-dark"
          >
            ← {previousLesson.title}
          </Link>
        ) : (
          <span />
        )}
        {nextLesson ? (
          <Link
            href={`/student/courses/${params.slug}/lessons/${nextLesson.id}`}
            className="font-medium text-brand-blue-dark"
          >
            {nextLesson.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
