import { PrismaClient, Role, PracticeDifficulty, PracticeType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@utopianscore.dev" },
    update: {},
    create: {
      name: "Ada Admin",
      email: "admin@utopianscore.dev",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const faculty = await prisma.user.upsert({
    where: { email: "faculty@utopianscore.dev" },
    update: {},
    create: {
      name: "Frank Faculty",
      email: "faculty@utopianscore.dev",
      passwordHash,
      role: Role.FACULTY,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@utopianscore.dev" },
    update: {},
    create: {
      name: "Sam Student",
      email: "student@utopianscore.dev",
      passwordHash,
      role: Role.STUDENT,
    },
  });

  const course = await prisma.course.upsert({
    where: { slug: "python-foundations" },
    update: {},
    create: {
      title: "Python Foundations",
      slug: "python-foundations",
      description:
        "A first course in Python: variables, control flow, and functions.",
      published: true,
      facultyId: faculty.id,
      modules: {
        create: [
          {
            title: "Getting Started",
            order: 1,
            lessons: {
              create: [
                {
                  title: "What is Python?",
                  order: 1,
                  content:
                    "Python is a general-purpose programming language known for readable syntax.",
                },
                {
                  title: "Variables and Types",
                  order: 2,
                  content:
                    "Variables store values. Python is dynamically typed: a name can be reassigned to a different type.",
                },
              ],
            },
          },
          {
            title: "Control Flow",
            order: 2,
            lessons: {
              create: [
                {
                  title: "Conditionals",
                  order: 1,
                  content:
                    "if / elif / else statements let a program branch based on a condition.",
                },
                {
                  title: "Loops",
                  order: 2,
                  content:
                    "for and while loops let a program repeat work until a condition is met.",
                },
              ],
            },
          },
        ],
      },
    },
    include: { modules: { include: { lessons: true } } },
  });

  const secondCourse = await prisma.course.upsert({
    where: { slug: "web-fundamentals" },
    update: {},
    create: {
      title: "Web Fundamentals",
      slug: "web-fundamentals",
      description: "HTML, CSS, and the basics of how the web works.",
      published: true,
      facultyId: faculty.id,
      modules: {
        create: [
          {
            title: "Structure and Style",
            order: 1,
            lessons: {
              create: [
                {
                  title: "HTML Basics",
                  order: 1,
                  content: "HTML describes the structure of a web page using elements.",
                },
                {
                  title: "CSS Basics",
                  order: 2,
                  content: "CSS describes how HTML elements should look.",
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Enroll the seed student in the first course and complete one lesson.
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course.id } },
    update: {},
    create: { userId: student.id, courseId: course.id },
  });

  const firstLesson = await prisma.lesson.findFirst({
    where: { module: { courseId: course.id } },
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
  });

  if (firstLesson) {
    await prisma.progress.upsert({
      where: { userId_lessonId: { userId: student.id, lessonId: firstLesson.id } },
      update: { completed: true, completedAt: new Date() },
      create: {
        userId: student.id,
        lessonId: firstLesson.id,
        completed: true,
        completedAt: new Date(),
      },
    });
  }

  // ── Phase 3: Practice domain seed data ────────────────────────────
  const [skillLoops, skillArrays] = await Promise.all([
    prisma.skill.upsert({
      where: { slug: "loops" },
      update: {},
      create: { name: "Loops", slug: "loops" },
    }),
    prisma.skill.upsert({
      where: { slug: "arrays" },
      update: {},
      create: { name: "Arrays", slug: "arrays" },
    }),
  ]);

  const mcqProblem = await prisma.practiceProblem.upsert({
    where: { slug: "python-for-loop-output" },
    update: {},
    create: {
      title: "What does this loop print?",
      slug: "python-for-loop-output",
      description: "for i in range(3):\n    print(i)\n\nWhat gets printed?",
      difficulty: PracticeDifficulty.EASY,
      type: PracticeType.MCQ,
      published: true,
      explanation:
        "range(3) produces 0, 1, 2 — range(n) starts at 0 and stops before n, so the loop prints 0, then 1, then 2.",
      createdById: faculty.id,
      skills: { connect: [{ id: skillLoops.id }] },
      options: {
        create: [
          { text: "0 1 2", isCorrect: true, order: 1 },
          { text: "1 2 3", isCorrect: false, order: 2 },
          { text: "0 1 2 3", isCorrect: false, order: 3 },
          { text: "It raises an error", isCorrect: false, order: 4 },
        ],
      },
    },
  });

  const codingProblem = await prisma.practiceProblem.upsert({
    where: { slug: "find-maximum" },
    update: {},
    create: {
      title: "Find the Maximum",
      slug: "find-maximum",
      description: "Write a function that returns the largest number in a list of integers.",
      difficulty: PracticeDifficulty.EASY,
      type: PracticeType.CODING,
      published: true,
      starterCode: "def find_maximum(numbers):\n    # your code here\n    pass\n",
      examples: "Input: [3, 7, 2] -> Output: 7",
      constraints: "1 <= len(numbers) <= 10^4",
      explanation:
        "A single pass keeping a running maximum is O(n) time and O(1) space — no need to sort.",
      createdById: faculty.id,
      skills: { connect: [{ id: skillArrays.id }] },
      testCases: {
        create: [
          { input: "[3, 7, 2]", expectedOutput: "7", isHidden: false, order: 1 },
          { input: "[-5, -1, -9]", expectedOutput: "-1", isHidden: false, order: 2 },
          { input: "[1000000, 2, 3]", expectedOutput: "1000000", isHidden: true, order: 3 },
        ],
      },
    },
  });

  console.log("Practice seed:", mcqProblem.title, "/", codingProblem.title);

  console.log("Seed complete.");
  console.log({ admin: admin.email, faculty: faculty.email, student: student.email });
  console.log("Courses:", course.title, "/", secondCourse.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
