"use client";

import { useFormState } from "react-dom";
import { createLesson } from "@/app/actions/faculty";
import { initialActionResult } from "@/lib/action-result";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/forms/submit-button";
import { FeedbackBanner } from "@/components/forms/feedback-banner";

export function AddLessonForm({
  courseId,
  moduleId,
}: {
  courseId: string;
  moduleId: string;
}) {
  const [result, formAction] = useFormState(
    createLesson.bind(null, courseId, moduleId),
    initialActionResult
  );

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <Input name="title" required minLength={2} placeholder="Lesson title" />
      <textarea
        name="content"
        required
        minLength={10}
        rows={3}
        className="w-full rounded-xl border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-blue-dark focus:ring-2 focus:ring-brand-blue"
        placeholder="Lesson content"
      />
      <SubmitButton pendingLabel="Adding…" variant="secondary">
        Add lesson
      </SubmitButton>
      <FeedbackBanner result={result} />
    </form>
  );
}
