"use client";

import { useFormState } from "react-dom";
import { completeLesson } from "@/app/actions/student";
import { initialActionResult } from "@/lib/action-result";
import { SubmitButton } from "@/components/forms/submit-button";
import { FeedbackBanner } from "@/components/forms/feedback-banner";

export function CompleteLessonButton({ lessonId }: { lessonId: string }) {
  const [result, formAction] = useFormState(
    completeLesson.bind(null, lessonId),
    initialActionResult
  );

  return (
    <form action={formAction}>
      <SubmitButton pendingLabel="Saving…">Mark lesson complete</SubmitButton>
      <FeedbackBanner result={result} />
    </form>
  );
}
