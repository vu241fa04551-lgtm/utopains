"use client";

import { useFormState } from "react-dom";
import { submitMcqAttempt } from "@/app/actions/practice";
import { initialActionResult } from "@/lib/action-result";
import { SubmitButton } from "@/components/forms/submit-button";
import { FeedbackBanner } from "@/components/forms/feedback-banner";

export function McqForm({
  problemId,
  options,
}: {
  problemId: string;
  options: { id: string; text: string }[];
}) {
  const [result, formAction] = useFormState(
    submitMcqAttempt.bind(null, problemId),
    initialActionResult
  );

  return (
    <form action={formAction} className="space-y-3">
      <fieldset className="space-y-2">
        <legend className="sr-only">Choose an answer</legend>
        {options.map((option) => (
          <label
            key={option.id}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-100 px-4 py-3 text-sm text-ink-900 hover:border-brand-blue-dark"
          >
            <input type="radio" name="optionId" value={option.id} required className="h-4 w-4" />
            {option.text}
          </label>
        ))}
      </fieldset>
      <SubmitButton pendingLabel="Checking…">Submit answer</SubmitButton>
      <FeedbackBanner result={result} />
    </form>
  );
}
