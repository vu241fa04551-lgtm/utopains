import { requireRole } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createCourse } from "@/app/actions/faculty";
import { Role } from "@prisma/client";

export default async function NewCoursePage() {
  await requireRole([Role.FACULTY, Role.ADMIN]);

  return (
    <main className="mx-auto max-w-lg space-y-6 px-6 py-10">
      <h1 className="text-2xl font-semibold text-ink-900">New course</h1>

      <Card>
        <form action={createCourse} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-700">Title</label>
            <Input name="title" required minLength={3} placeholder="Python Foundations" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-700">
              Description
            </label>
            <textarea
              name="description"
              required
              minLength={10}
              rows={4}
              className="w-full rounded-xl border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-blue-dark focus:ring-2 focus:ring-brand-blue"
              placeholder="What will students learn in this course?"
            />
          </div>
          <Button type="submit" className="w-full">
            Create course
          </Button>
        </form>
      </Card>
    </main>
  );
}
