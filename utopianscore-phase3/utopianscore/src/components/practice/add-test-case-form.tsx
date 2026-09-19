"use client";

import { useFormState } from "react-dom";
import { addTestCase } from "@/app/actions/faculty-practice";
import { initialActionResult } from "@/lib/action-result";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/forms/submit-button";
import { FeedbackBanner } from "@/components/forms/feedback-banner";

export function AddTestCaseForm({ problemId }: { problemId: string }) {
  const [result, formAction] = useFormState(
    addTestCase.bind(null, problemId),
    initialActionResult
  );

  return (
    <form action={formAction} className="space-y-3">
      <Input name="input" required placeholder="Input" />
      <Input name="expectedOutput" required placeholder="Expected output" />
      <label className="flex items-center gap-2 text-xs text-ink-700">
        <input type="checkbox" name="isHidden" className="h-4 w-4" />
        Hidden (not shown to students)
      </label>
      <SubmitButton pendingLabel="Saving…" variant="secondary">
        Add test case
      </SubmitButton>
      <FeedbackBanner result={result} />
    </form>
  );
}
