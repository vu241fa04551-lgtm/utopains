import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublishToggle } from "@/components/faculty/publish-toggle";
import { AddModuleForm } from "@/components/faculty/add-module-form";
import { AddLessonForm } from "@/components/faculty/add-lesson-form";
import { Role } from "@prisma/client";

export default async function ManageCoursePage({ params }: { params: { id: string } }) {
  const user = await requireRole([Role.FACULTY, Role.ADMIN]);

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!course) notFound();
  if (course.facultyId !== user.id && user.role !== Role.ADMIN) notFound();

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">{course.title}</h1>
          <p className="mt-1 text-sm text-ink-500">{course.description}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge tone={course.published ? "success" : "neutral"}>
            {course.published ? "Published" : "Draft"}
          </Badge>
          <PublishToggle courseId={course.id} published={course.published} />
        </div>
      </header>

      <section className="space-y-4">
        {course.modules.length === 0 && (
          <p className="text-sm text-ink-500">
            No modules yet — add one below to start building this course.
          </p>
        )}

        {course.modules.map((module) => (
          <Card key={module.id}>
            <h2 className="font-medium text-ink-900">{module.title}</h2>

            <ul className="mt-3 space-y-2">
              {module.lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="rounded-lg border border-ink-100 px-3 py-2 text-sm text-ink-700"
                >
                  {lesson.title}
                </li>
              ))}
              {module.lessons.length === 0 && (
                <li className="text-sm text-ink-500">No lessons yet.</li>
              )}
            </ul>

            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium text-brand-blue-dark">
                + Add lesson
              </summary>
              <AddLessonForm courseId={course.id} moduleId={module.id} />
            </details>
          </Card>
        ))}
      </section>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-ink-700">Add a module</h2>
        <AddModuleForm courseId={course.id} />
      </Card>
    </main>
  );
}
