import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Role } from "@prisma/client";

export default async function FacultyDashboardPage() {
  const user = await requireRole([Role.FACULTY, Role.ADMIN]);

  const courses = await prisma.course.findMany({
    where: { facultyId: user.id },
    include: {
      modules: { include: { lessons: true } },
      enrollments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Your courses</h1>
          <p className="text-sm text-ink-500">Create and manage your teaching content.</p>
        </div>
        <Link href="/faculty/courses/new">
          <Button>New course</Button>
        </Link>
      </header>

      {courses.length === 0 ? (
        <EmptyState
          title="You haven't created a course yet"
          description="Create your first course to start adding modules and lessons."
          action={
            <Link href="/faculty/courses/new">
              <Button>Create a course</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => {
            const lessonCount = course.modules.reduce((n, m) => n + m.lessons.length, 0);
            return (
              <Card key={course.id}>
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-ink-900">{course.title}</h3>
                  <Badge tone={course.published ? "success" : "neutral"}>
                    {course.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-ink-500">
                  {course.modules.length} modules · {lessonCount} lessons ·{" "}
                  {course.enrollments.length} enrolled
                </p>
                <Link
                  href={`/faculty/courses/${course.id}`}
                  className="mt-3 inline-block text-sm font-medium text-brand-blue-dark"
                >
                  Manage →
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
