"use client";

import { useFormState } from "react-dom";
import { updateCodingContent } from "@/app/actions/faculty-practice";
import { initialActionResult } from "@/lib/action-result";
import { SubmitButton } from "@/components/forms/submit-button";
import { FeedbackBanner } from "@/components/forms/feedback-banner";

export function CodingContentForm({
  problemId,
  starterCode,
  constraints,
  examples,
}: {
  problemId: string;
  starterCode: string | null;
  constraints: string | null;
  examples: string | null;
}) {
  const [result, formAction] = useFormState(
    updateCodingContent.bind(null, problemId),
    initialActionResult
  );

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="text-xs font-medium text-ink-700">Starter code</label>
        <textarea
          name="starterCode"
          rows={5}
          defaultValue={starterCode ?? ""}
          spellCheck={false}
          className="mt-1 w-full rounded-xl border border-ink-100 bg-ink-900 px-3 py-2 font-mono text-sm text-ink-100 outline-none focus:border-brand-blue-dark focus:ring-2 focus:ring-brand-blue"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-ink-700">Examples</label>
        <textarea
          name="examples"
          rows={3}
          defaultValue={examples ?? ""}
          className="mt-1 w-full rounded-xl border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-blue-dark focus:ring-2 focus:ring-brand-blue"
          placeholder="e.g. Input: [1,2,3] -> Output: 6"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-ink-700">Constraints</label>
        <textarea
          name="constraints"
          rows={2}
          defaultValue={constraints ?? ""}
          className="mt-1 w-full rounded-xl border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-blue-dark focus:ring-2 focus:ring-brand-blue"
          placeholder="e.g. 1 <= n <= 10^4"
        />
      </div>
      <SubmitButton pendingLabel="Saving…">Save content</SubmitButton>
      <FeedbackBanner result={result} />
    </form>
  );
}
