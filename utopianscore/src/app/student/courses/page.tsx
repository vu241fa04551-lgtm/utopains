import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Role } from "@prisma/client";

export default async function CourseCatalogPage() {
  const user = await requireRole([Role.STUDENT, Role.ADMIN]);

  const courses = await prisma.course.findMany({
    where: { published: true },
    include: {
      modules: { include: { lessons: true } },
      enrollments: { where: { userId: user.id } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900">Courses</h1>
        <p className="text-sm text-ink-500">Pick a course to start learning.</p>
      </header>

      {courses.length === 0 ? (
        <EmptyState
          title="No courses available yet"
          description="Check back soon — faculty are still publishing content."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => {
            const lessonCount = course.modules.reduce((n, m) => n + m.lessons.length, 0);
            const enrolled = course.enrollments.length > 0;
            return (
              <Card key={course.id}>
                <h3 className="font-medium text-ink-900">{course.title}</h3>
                <p className="mt-1 text-sm text-ink-500">{course.description}</p>
                <p className="mt-2 text-xs text-ink-500">
                  {course.modules.length} modules · {lessonCount} lessons
                </p>
                <div className="mt-4">
                  <Link href={`/student/courses/${course.slug}`}>
                    <Button variant={enrolled ? "ghost" : "primary"}>
                      {enrolled ? "Continue" : "View course"}
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
