"use client";

import { useFormState } from "react-dom";
import { addOption } from "@/app/actions/faculty-practice";
import { initialActionResult } from "@/lib/action-result";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/forms/submit-button";
import { FeedbackBanner } from "@/components/forms/feedback-banner";

export function AddOptionForm({ problemId }: { problemId: string }) {
  const [result, formAction] = useFormState(
    addOption.bind(null, problemId),
    initialActionResult
  );

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3">
      <Input name="text" required placeholder="Option text" className="flex-1" />
      <label className="flex items-center gap-2 text-xs text-ink-700">
        <input type="checkbox" name="isCorrect" className="h-4 w-4" />
        Correct answer
      </label>
      <SubmitButton pendingLabel="Adding…">Add option</SubmitButton>
      <FeedbackBanner result={result} />
    </form>
  );
}
