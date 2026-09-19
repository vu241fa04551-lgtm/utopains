"use client";

import { useFormState } from "react-dom";
import { enrollInCourse } from "@/app/actions/student";
import { initialActionResult } from "@/lib/action-result";
import { SubmitButton } from "@/components/forms/submit-button";
import { FeedbackBanner } from "@/components/forms/feedback-banner";

export function EnrollButton({ courseId }: { courseId: string }) {
  const [result, formAction] = useFormState(
    enrollInCourse.bind(null, courseId),
    initialActionResult
  );

  return (
    <form action={formAction}>
      <SubmitButton pendingLabel="Enrolling…">Enroll in this course</SubmitButton>
      <FeedbackBanner result={result} />
    </form>
  );
}
