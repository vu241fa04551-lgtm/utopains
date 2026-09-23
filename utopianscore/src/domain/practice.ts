// Pure practice-domain logic — no I/O, unit-tested directly.

export type AttemptOutcome = "CORRECT" | "INCORRECT" | "UNGRADED";

export interface OptionRef {
  id: string;
  isCorrect: boolean;
}

// The full option list (including which one is correct) is only ever
// passed to this function on the server, from a Server Action — it is
// never sent to the client until after an attempt exists.
export function gradeMcqSelection(
  options: OptionRef[],
  selectedOptionId: string
): "CORRECT" | "INCORRECT" {
  const selected = options.find((o) => o.id === selectedOptionId);
  return selected?.isCorrect ? "CORRECT" : "INCORRECT";
}

export interface AttemptRef {
  problemId: string;
  outcome: AttemptOutcome;
}

export interface PracticeStats {
  attempted: number;
  solved: number;
  accuracy: number; // over graded (MCQ) attempts only — coding is UNGRADED
}

export function calculatePracticeStats(attempts: AttemptRef[]): PracticeStats {
  const attemptedProblemIds = new Set(attempts.map((a) => a.problemId));
  const gradedAttempts = attempts.filter((a) => a.outcome !== "UNGRADED");
  const correctAttempts = attempts.filter((a) => a.outcome === "CORRECT");
  const solvedProblemIds = new Set(correctAttempts.map((a) => a.problemId));

  const accuracy =
    gradedAttempts.length === 0
      ? 0
      : Math.round((correctAttempts.length / gradedAttempts.length) * 100);

  return {
    attempted: attemptedProblemIds.size,
    solved: solvedProblemIds.size,
    accuracy,
  };
}
