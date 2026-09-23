"use client";

import { useFormState } from "react-dom";
import { createModule } from "@/app/actions/faculty";
import { initialActionResult } from "@/lib/action-result";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/forms/submit-button";
import { FeedbackBanner } from "@/components/forms/feedback-banner";

export function AddModuleForm({ courseId }: { courseId: string }) {
  const [result, formAction] = useFormState(
    createModule.bind(null, courseId),
    initialActionResult
  );

  return (
    <form action={formAction} className="flex gap-3">
      <Input name="title" required minLength={2} placeholder="Module title" />
      <SubmitButton pendingLabel="Adding…">Add</SubmitButton>
      <FeedbackBanner result={result} />
    </form>
  );
}
