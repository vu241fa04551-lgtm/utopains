import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { completeLesson } from "@/app/actions/student";
import { Role } from "@prisma/client";

export default async function LessonPage({
  params,
}: {
  params: { slug: string; lessonId: string };
}) {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: { module: { include: { course: true } } },
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

  async function markComplete() {
    "use server";
    await completeLesson(lesson!.id);
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-6 py-10">
      <Link
        href={`/student/courses/${params.slug}`}
        className="text-sm text-ink-500 hover:text-ink-900"
      >
        ← Back to course
      </Link>

      <header className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-ink-900">{lesson.title}</h1>
        {progress?.completed && <Badge tone="success">Completed</Badge>}
      </header>

      <Card>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
          {lesson.content}
        </p>
      </Card>

      {!progress?.completed && (
        <form action={markComplete}>
          <Button type="submit">Mark lesson complete</Button>
        </form>
      )}
    </main>
  );
}
