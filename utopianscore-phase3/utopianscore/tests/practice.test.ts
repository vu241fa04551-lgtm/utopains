import { describe, expect, it } from "vitest";
import { calculatePracticeStats, gradeMcqSelection } from "@/domain/practice";

describe("gradeMcqSelection", () => {
  const options = [
    { id: "a", isCorrect: false },
    { id: "b", isCorrect: true },
    { id: "c", isCorrect: false },
  ];

  it("returns CORRECT when the selected option is marked correct", () => {
    expect(gradeMcqSelection(options, "b")).toBe("CORRECT");
  });

  it("returns INCORRECT when the selected option is marked wrong", () => {
    expect(gradeMcqSelection(options, "a")).toBe("INCORRECT");
  });

  it("returns INCORRECT for an option id that doesn't exist", () => {
    expect(gradeMcqSelection(options, "does-not-exist")).toBe("INCORRECT");
  });
});

describe("calculatePracticeStats", () => {
  it("returns zeros for no attempts", () => {
    expect(calculatePracticeStats([])).toEqual({ attempted: 0, solved: 0, accuracy: 0 });
  });

  it("counts distinct attempted and solved problems", () => {
    const attempts = [
      { problemId: "p1", outcome: "INCORRECT" as const },
      { problemId: "p1", outcome: "CORRECT" as const }, // retried and solved
      { problemId: "p2", outcome: "CORRECT" as const },
      { problemId: "p3", outcome: "UNGRADED" as const }, // coding, saved only
    ];
    const stats = calculatePracticeStats(attempts);
    expect(stats.attempted).toBe(3);
    expect(stats.solved).toBe(2);
  });

  it("computes accuracy only over graded (non-coding) attempts", () => {
    const attempts = [
      { problemId: "p1", outcome: "CORRECT" as const },
      { problemId: "p2", outcome: "INCORRECT" as const },
      { problemId: "p3", outcome: "UNGRADED" as const },
      { problemId: "p3", outcome: "UNGRADED" as const },
    ];
    // 1 correct out of 2 graded attempts = 50%, the two UNGRADED ones excluded
    expect(calculatePracticeStats(attempts).accuracy).toBe(50);
  });

  it("returns 0% accuracy when only ungraded (coding) attempts exist", () => {
    const attempts = [
      { problemId: "p1", outcome: "UNGRADED" as const },
      { problemId: "p2", outcome: "UNGRADED" as const },
    ];
    expect(calculatePracticeStats(attempts).accuracy).toBe(0);
  });
});
