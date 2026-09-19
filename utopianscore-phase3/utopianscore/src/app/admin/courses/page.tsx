import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Role } from "@prisma/client";

export default async function AdminCoursesPage() {
  await requireRole([Role.ADMIN]);

  const courses = await prisma.course.findMany({
    include: {
      faculty: true,
      modules: { include: { lessons: true } },
      enrollments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900">Courses</h1>
        <p className="text-sm text-ink-500">{courses.length} courses across the platform</p>
      </header>

      <Card className="divide-y divide-ink-100 p-0">
        {courses.map((course) => {
          const lessonCount = course.modules.reduce((n, m) => n + m.lessons.length, 0);
          return (
            <div key={course.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink-900">{course.title}</p>
                <Badge tone={course.published ? "success" : "neutral"}>
                  {course.published ? "Published" : "Draft"}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-ink-500">
                by {course.faculty.name} · {course.modules.length} modules · {lessonCount}{" "}
                lessons · {course.enrollments.length} enrolled
              </p>
            </div>
          );
        })}
      </Card>
    </main>
  );
}
