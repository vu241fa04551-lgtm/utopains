// Pure domain logic for course progress — no I/O, so it's directly
// unit-testable without a database (see tests/progress.test.ts).

export interface LessonRef {
  id: string;
}

export interface ProgressRef {
  lessonId: string;
  completed: boolean;
}

export function calculateCourseProgress(
  lessons: LessonRef[],
  progress: ProgressRef[]
): { completed: number; total: number; percent: number } {
  const total = lessons.length;
  if (total === 0) {
    return { completed: 0, total: 0, percent: 0 };
  }

  const completedLessonIds = new Set(
    progress.filter((p) => p.completed).map((p) => p.lessonId)
  );
  const completed = lessons.filter((l) => completedLessonIds.has(l.id)).length;
  const percent = Math.round((completed / total) * 100);

  return { completed, total, percent };
}
