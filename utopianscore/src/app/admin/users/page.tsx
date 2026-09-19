import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleSelect } from "@/components/role-select";
import { Role } from "@prisma/client";

export default async function AdminUsersPage() {
  const admin = await requireRole([Role.ADMIN]);

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900">Users</h1>
        <p className="text-sm text-ink-500">{users.length} accounts</p>
      </header>

      <Card className="divide-y divide-ink-100 p-0">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-medium text-ink-900">{u.name}</p>
              <p className="text-xs text-ink-500">{u.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                tone={
                  u.role === "ADMIN" ? "advanced" : u.role === "FACULTY" ? "progress" : "neutral"
                }
              >
                {u.role}
              </Badge>
              {u.id !== admin.id && <RoleSelect userId={u.id} role={u.role} />}
            </div>
          </div>
        ))}
      </Card>
    </main>
  );
}
