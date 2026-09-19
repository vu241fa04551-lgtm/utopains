import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { calculateCourseProgress } from "@/domain/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { enrollInCourse } from "@/app/actions/student";
import { Role } from "@prisma/client";

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);

  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
    include: { modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } } },
  });
  if (!course || !course.published) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });

  const progressRows = enrollment
    ? await prisma.progress.findMany({ where: { userId: user.id } })
    : [];

  const lessons = course.modules.flatMap((m) => m.lessons);
  const progress = calculateCourseProgress(lessons, progressRows);
  const completedLessonIds = new Set(
    progressRows.filter((p) => p.completed).map((p) => p.lessonId)
  );

  async function enroll() {
    "use server";
    await enrollInCourse(course!.id);
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900">{course.title}</h1>
        <p className="mt-1 text-sm text-ink-500">{course.description}</p>
      </header>

      {enrollment ? (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <Badge tone="progress">Enrolled</Badge>
              <p className="mt-1 text-sm text-ink-500">
                {progress.completed} of {progress.total} lessons complete
              </p>
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar percent={progress.percent} />
          </div>
        </Card>
      ) : (
        <form action={enroll}>
          <Button type="submit">Enroll in this course</Button>
        </form>
      )}

      <section className="space-y-4">
        {course.modules.map((module) => (
          <div key={module.id}>
            <h2 className="mb-2 text-sm font-semibold text-ink-700">{module.title}</h2>
            <div className="space-y-2">
              {module.lessons.map((lesson) => {
                const done = completedLessonIds.has(lesson.id);
                return (
                  <Card key={lesson.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      {done ? <Badge tone="success">Done</Badge> : <Badge>Not started</Badge>}
                      <span className="text-sm text-ink-900">{lesson.title}</span>
                    </div>
                    {enrollment ? (
                      <Link
                        href={`/student/courses/${course.slug}/lessons/${lesson.id}`}
                        className="text-sm font-medium text-brand-blue-dark"
                      >
                        {done ? "Review" : "Start"} →
                      </Link>
                    ) : (
                      <span className="text-xs text-ink-500">Enroll to access</span>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
