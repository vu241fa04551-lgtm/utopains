import { requireRole } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createProblem } from "@/app/actions/faculty-practice";
import { Role } from "@prisma/client";

export default async function NewPracticeProblemPage() {
  await requireRole([Role.FACULTY, Role.ADMIN]);

  return (
    <main className="mx-auto max-w-lg space-y-6 px-6 py-10">
      <h1 className="text-2xl font-semibold text-ink-900">New practice problem</h1>

      <Card>
        <form action={createProblem} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-700">Title</label>
            <Input name="title" required minLength={3} placeholder="Two Sum" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-700">Description</label>
            <textarea
              name="description"
              required
              minLength={10}
              rows={4}
              className="w-full rounded-xl border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-blue-dark focus:ring-2 focus:ring-brand-blue"
              placeholder="What is the student being asked to do?"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-700">Type</label>
              <select
                name="type"
                required
                defaultValue="MCQ"
                className="w-full rounded-xl border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900"
              >
                <option value="MCQ">Multiple choice</option>
                <option value="CODING">Coding</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-700">Difficulty</label>
              <select
                name="difficulty"
                required
                defaultValue="EASY"
                className="w-full rounded-xl border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-ink-500">
            {"Coding problems can be authored fully (test cases, starter code), but running/"}
            {"grading student code isn't available yet — see the README."}
          </p>
          <Button type="submit" className="w-full">
            Create problem
          </Button>
        </form>
      </Card>
    </main>
  );
}
