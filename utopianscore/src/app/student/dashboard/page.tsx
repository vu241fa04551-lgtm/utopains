import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { calculateCourseProgress } from "@/domain/progress";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Role } from "@prisma/client";

export default async function StudentDashboardPage() {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: { modules: { include: { lessons: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const progressRows = await prisma.progress.findMany({ where: { userId: user.id } });

  const coursesWithProgress = enrollments.map((e) => {
    const lessons = e.course.modules.flatMap((m) => m.lessons);
    const progress = calculateCourseProgress(lessons, progressRows);
    return { course: e.course, ...progress };
  });

  const inProgress = coursesWithProgress.find((c) => c.percent < 100) ?? coursesWithProgress[0];

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900">Welcome back, {user.name}</h1>
        <p className="text-sm text-ink-500">Here's where you left off.</p>
      </header>

      {inProgress ? (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <Badge tone="progress">Continue learning</Badge>
              <h2 className="mt-2 text-lg font-semibold text-ink-900">
                {inProgress.course.title}
              </h2>
              <p className="text-sm text-ink-500">
                {inProgress.completed} of {inProgress.total} lessons complete
              </p>
            </div>
            <Link href={`/student/courses/${inProgress.course.slug}`}>
              <Button>Continue</Button>
            </Link>
          </div>
          <div className="mt-4">
            <ProgressBar percent={inProgress.percent} />
          </div>
        </Card>
      ) : (
        <EmptyState
          title="No courses yet"
          description="Enroll in a course to start your first lesson."
          action={
            <Link href="/student/courses">
              <Button>Browse courses</Button>
            </Link>
          }
        />
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-ink-700">Your courses</h2>
        {coursesWithProgress.length === 0 ? (
          <p className="text-sm text-ink-500">You haven't enrolled in any courses yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {coursesWithProgress.map(({ course, percent, completed, total }) => (
              <Card key={course.id}>
                <h3 className="font-medium text-ink-900">{course.title}</h3>
                <p className="mt-1 text-xs text-ink-500">
                  {completed}/{total} lessons
                </p>
                <div className="mt-3">
                  <ProgressBar percent={percent} />
                </div>
                <Link
                  href={`/student/courses/${course.slug}`}
                  className="mt-3 inline-block text-sm font-medium text-brand-blue-dark"
                >
                  Open course →
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
