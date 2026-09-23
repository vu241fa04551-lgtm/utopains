"use client";

import { useFormState } from "react-dom";
import { togglePublishProblem } from "@/app/actions/faculty-practice";
import { initialActionResult } from "@/lib/action-result";
import { SubmitButton } from "@/components/forms/submit-button";
import { FeedbackBanner } from "@/components/forms/feedback-banner";

export function ProblemPublishToggle({
  problemId,
  published,
}: {
  problemId: string;
  published: boolean;
}) {
  const [result, formAction] = useFormState(
    togglePublishProblem.bind(null, problemId),
    initialActionResult
  );

  return (
    <div className="text-right">
      <form action={formAction}>
        <SubmitButton pendingLabel="Saving…" variant={published ? "ghost" : "primary"}>
          {published ? "Unpublish" : "Publish"}
        </SubmitButton>
      </form>
      <FeedbackBanner result={result} />
    </div>
  );
}
