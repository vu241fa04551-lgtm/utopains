"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import { saveCodingAttempt } from "@/app/actions/practice";
import { initialActionResult } from "@/lib/action-result";
import { SubmitButton } from "@/components/forms/submit-button";
import { FeedbackBanner } from "@/components/forms/feedback-banner";

// Honest by design: there is no sandboxed execution worker in this
// environment, so this only ever offers "Save" — never "Run" or
// "Submit" with a fake pass/fail result. See README "Phase 3".
export function CodingSaveForm({
  problemId,
  starterCode,
}: {
  problemId: string;
  starterCode: string | null;
}) {
  const [result, formAction] = useFormState(
    saveCodingAttempt.bind(null, problemId),
    initialActionResult
  );
  const [code, setCode] = useState(starterCode ?? "");

  return (
    <form action={formAction} className="space-y-3">
      <div
        role="status"
        className="rounded-xl border border-brand-orange/40 bg-brand-orange/10 px-4 py-3 text-sm text-brand-orange-dark"
      >
        Running and grading code isn't available in this environment yet — there's no
        sandboxed execution worker set up. Your code can still be saved to your account
        so you don't lose it.
      </div>

      <label htmlFor="sourceCode" className="text-xs font-medium text-ink-700">
        Your code
      </label>
      <textarea
        id="sourceCode"
        name="sourceCode"
        required
        rows={14}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        className="w-full rounded-xl border border-ink-100 bg-ink-900 px-4 py-3 font-mono text-sm text-ink-100 outline-none focus:border-brand-blue-dark focus:ring-2 focus:ring-brand-blue"
      />

      <div>
        <label htmlFor="language" className="text-xs font-medium text-ink-700">
          Language (for your own reference)
        </label>
        <select
          id="language"
          name="language"
          defaultValue="python"
          className="mt-1 rounded-lg border border-ink-100 bg-white px-2 py-1 text-sm text-ink-700"
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="other">Other</option>
        </select>
      </div>

      <SubmitButton pendingLabel="Saving…">Save code</SubmitButton>
      <FeedbackBanner result={result} />
    </form>
  );
}
