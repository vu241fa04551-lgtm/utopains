"use client";

import { useFormState } from "react-dom";
import { togglePublish } from "@/app/actions/faculty";
import { initialActionResult } from "@/lib/action-result";
import { SubmitButton } from "@/components/forms/submit-button";
import { FeedbackBanner } from "@/components/forms/feedback-banner";

export function PublishToggle({
  courseId,
  published,
}: {
  courseId: string;
  published: boolean;
}) {
  const [result, formAction] = useFormState(
    togglePublish.bind(null, courseId),
    initialActionResult
  );

  return (
    <div className="text-right">
      <form action={formAction}>
        <SubmitButton
          pendingLabel="Saving…"
          variant={published ? "ghost" : "primary"}
        >
          {published ? "Unpublish" : "Publish"}
        </SubmitButton>
      </form>
      <FeedbackBanner result={result} />
    </div>
  );
}
