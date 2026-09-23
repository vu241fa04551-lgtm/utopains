import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { calculateCourseProgress } from "@/domain/progress";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Role } from "@prisma/client";

export default async function StudentProgressPage() {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: { course: { include: { modules: { include: { lessons: true } } } } },
    orderBy: { createdAt: "asc" },
  });

  const allProgress = await prisma.progress.findMany({
    where: { userId: user.id, completed: true },
  });

  const recentProgress = await prisma.progress.findMany({
    where: { userId: user.id, completed: true },
    orderBy: { completedAt: "desc" },
    take: 10,
    include: { lesson: { include: { module: { include: { course: true } } } } },
  });

  const coursesWithProgress = enrollments.map((e) => {
    const lessons = e.course.modules.flatMap((m) => m.lessons);
    return { course: e.course, ...calculateCourseProgress(lessons, allProgress) };
  });

  const totalLessons = coursesWithProgress.reduce((n, c) => n + c.total, 0);
  const totalCompleted = coursesWithProgress.reduce((n, c) => n + c.completed, 0);
  const coursesCompleted = coursesWithProgress.filter((c) => c.total > 0 && c.percent === 100).length;

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900">Your progress</h1>
        <p className="text-sm text-ink-500">
          {totalCompleted} of {totalLessons} lessons completed across {enrollments.length}{" "}
          {enrollments.length === 1 ? "course" : "courses"}.
        </p>
      </header>

      {enrollments.length === 0 ? (
        <EmptyState
          title="No progress yet"
          description="Enroll in a course to start building a learning history."
          action={
            <Link href="/student/courses">
              <Button>Browse courses</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center">
              <p className="text-2xl font-semibold text-ink-900">{enrollments.length}</p>
              <p className="mt-1 text-xs text-ink-500">Courses enrolled</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-semibold text-ink-900">{coursesCompleted}</p>
              <p className="mt-1 text-xs text-ink-500">Courses completed</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-semibold text-ink-900">{totalCompleted}</p>
              <p className="mt-1 text-xs text-ink-500">Lessons completed</p>
            </Card>
          </div>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-ink-700">By course</h2>
            {coursesWithProgress.map(({ course, percent, completed, total }) => (
              <Card key={course.id}>
                <div className="flex items-center justify-between">
                  <Link
                    href={`/student/courses/${course.slug}`}
                    className="font-medium text-ink-900 hover:text-brand-blue-dark"
                  >
                    {course.title}
                  </Link>
                  <span className="text-xs text-ink-500">
                    {completed}/{total} lessons
                  </span>
                </div>
                <div className="mt-3">
                  <ProgressBar percent={percent} />
                </div>
              </Card>
            ))}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-ink-700">Recent activity</h2>
            {recentProgress.length === 0 ? (
              <p className="text-sm text-ink-500">No completed lessons yet.</p>
            ) : (
              <Card className="divide-y divide-ink-100 p-0">
                {recentProgress.map((p) => (
                  <div key={p.id} className="px-6 py-3">
                    <p className="text-sm text-ink-900">{p.lesson.title}</p>
                    <p className="text-xs text-ink-500">
                      {p.lesson.module.course.title} ·{" "}
                      {p.completedAt?.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </Card>
            )}
          </section>
        </>
      )}
    </main>
  );
}
