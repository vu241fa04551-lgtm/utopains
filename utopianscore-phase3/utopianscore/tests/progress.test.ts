import { describe, expect, it } from "vitest";
import { calculateCourseProgress } from "@/domain/progress";

describe("calculateCourseProgress", () => {
  it("returns 0% for a course with no lessons", () => {
    const result = calculateCourseProgress([], []);
    expect(result).toEqual({ completed: 0, total: 0, percent: 0 });
  });

  it("returns 0% when nothing is completed", () => {
    const lessons = [{ id: "l1" }, { id: "l2" }];
    const result = calculateCourseProgress(lessons, []);
    expect(result).toEqual({ completed: 0, total: 2, percent: 0 });
  });

  it("computes a partial percentage correctly", () => {
    const lessons = [{ id: "l1" }, { id: "l2" }, { id: "l3" }, { id: "l4" }];
    const progress = [
      { lessonId: "l1", completed: true },
      { lessonId: "l2", completed: true },
      { lessonId: "l3", completed: false },
    ];
    const result = calculateCourseProgress(lessons, progress);
    expect(result).toEqual({ completed: 2, total: 4, percent: 50 });
  });

  it("ignores progress rows for lessons outside the course", () => {
    const lessons = [{ id: "l1" }];
    const progress = [{ lessonId: "unrelated-lesson", completed: true }];
    const result = calculateCourseProgress(lessons, progress);
    expect(result).toEqual({ completed: 0, total: 1, percent: 0 });
  });

  it("reaches 100% only when every lesson is completed", () => {
    const lessons = [{ id: "l1" }, { id: "l2" }];
    const progress = [
      { lessonId: "l1", completed: true },
      { lessonId: "l2", completed: true },
    ];
    const result = calculateCourseProgress(lessons, progress);
    expect(result.percent).toBe(100);
  });
});
