import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Role } from "@prisma/client";

export default async function AdminDashboardPage() {
  await requireRole([Role.ADMIN]);

  const [userCount, courseCount, publishedCount, enrollmentCount] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.course.count({ where: { published: true } }),
    prisma.enrollment.count(),
  ]);

  const stats = [
    { label: "Total users", value: userCount, href: "/admin/users" },
    { label: "Total courses", value: courseCount, href: "/admin/courses" },
    { label: "Published courses", value: publishedCount, href: "/admin/courses" },
    { label: "Enrollments", value: enrollmentCount, href: "/admin/courses" },
  ];

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900">Platform overview</h1>
        <p className="text-sm text-ink-500">Live counts from the database.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="text-center">
              <p className="text-2xl font-semibold text-ink-900">{s.value}</p>
              <p className="mt-1 text-xs text-ink-500">{s.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
