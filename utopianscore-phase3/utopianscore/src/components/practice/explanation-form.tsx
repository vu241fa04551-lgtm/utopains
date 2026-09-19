"use client";

import { useFormState } from "react-dom";
import { updateExplanation } from "@/app/actions/faculty-practice";
import { initialActionResult } from "@/lib/action-result";
import { SubmitButton } from "@/components/forms/submit-button";
import { FeedbackBanner } from "@/components/forms/feedback-banner";

export function ExplanationForm({
  problemId,
  explanation,
}: {
  problemId: string;
  explanation: string | null;
}) {
  const [result, formAction] = useFormState(
    updateExplanation.bind(null, problemId),
    initialActionResult
  );

  return (
    <form action={formAction} className="space-y-3">
      <textarea
        name="explanation"
        rows={4}
        defaultValue={explanation ?? ""}
        className="w-full rounded-xl border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-blue-dark focus:ring-2 focus:ring-brand-blue"
        placeholder="Shown to students after they attempt this problem — why the answer works, common mistakes, etc."
      />
      <SubmitButton pendingLabel="Saving…" variant="ghost">
        Save explanation
      </SubmitButton>
      <FeedbackBanner result={result} />
    </form>
  );
}
