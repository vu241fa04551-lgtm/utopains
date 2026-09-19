import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createModule, createLesson, togglePublish } from "@/app/actions/faculty";
import { Role } from "@prisma/client";

export default async function ManageCoursePage({ params }: { params: { id: string } }) {
  const user = await requireRole([Role.FACULTY, Role.ADMIN]);

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
    },
  });
  if (!course) notFound();
  if (course.facultyId !== user.id && user.role !== Role.ADMIN) notFound();

  async function publishToggle() {
    "use server";
    await togglePublish(course!.id);
  }

  async function addModule(formData: FormData) {
    "use server";
    await createModule(course!.id, formData);
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">{course.title}</h1>
          <p className="mt-1 text-sm text-ink-500">{course.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone={course.published ? "success" : "neutral"}>
            {course.published ? "Published" : "Draft"}
          </Badge>
          <form action={publishToggle}>
            <Button variant={course.published ? "ghost" : "primary"} type="submit">
              {course.published ? "Unpublish" : "Publish"}
            </Button>
          </form>
        </div>
      </header>

      <section className="space-y-4">
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
              <form
                action={async (formData: FormData) => {
                  "use server";
                  await createLesson(course!.id, module.id, formData);
                }}
                className="mt-3 space-y-3"
              >
                <Input name="title" required minLength={2} placeholder="Lesson title" />
                <textarea
                  name="content"
                  required
                  minLength={10}
                  rows={3}
                  className="w-full rounded-xl border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-blue-dark focus:ring-2 focus:ring-brand-blue"
                  placeholder="Lesson content"
                />
                <Button type="submit" variant="secondary">
                  Add lesson
                </Button>
              </form>
            </details>
          </Card>
        ))}
      </section>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-ink-700">Add a module</h2>
        <form action={addModule} className="flex gap-3">
          <Input name="title" required minLength={2} placeholder="Module title" />
          <Button type="submit">Add</Button>
        </form>
      </Card>
    </main>
  );
}
