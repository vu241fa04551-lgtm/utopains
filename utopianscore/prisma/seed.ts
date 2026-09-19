import { PrismaClient, Role } from "@prisma/client";
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
