import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { RoleSelect } from "@/components/role-select";
import { Role, Prisma } from "@prisma/client";

const roleFilters: Array<Role | "ALL"> = ["ALL", "STUDENT", "FACULTY", "ADMIN"];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; role?: string };
}) {
  const admin = await requireRole([Role.ADMIN]);
  const query = searchParams.q?.trim() ?? "";
  const roleFilter =
    searchParams.role && (Object.values(Role) as string[]).includes(searchParams.role)
      ? (searchParams.role as Role)
      : undefined;

  const where: Prisma.UserWhereInput = {
    ...(roleFilter ? { role: roleFilter } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const users = await prisma.user.findMany({ where, orderBy: { createdAt: "asc" } });

  function filterHref(role: Role | "ALL") {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (role !== "ALL") params.set("role", role);
    const qs = params.toString();
    return qs ? `/admin/users?${qs}` : "/admin/users";
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900">Users</h1>
        <p className="text-sm text-ink-500">{users.length} matching accounts</p>
      </header>

      <div className="space-y-3">
        <form method="GET" className="flex gap-2">
          {roleFilter && <input type="hidden" name="role" value={roleFilter} />}
          <Input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search by name or email…"
            aria-label="Search users"
          />
          <Button type="submit" variant="ghost">
            Search
          </Button>
        </form>

        <div className="flex gap-2">
          {roleFilters.map((r) => (
            <Link key={r} href={filterHref(r)}>
              <Button variant={(roleFilter ?? "ALL") === r ? "primary" : "ghost"}>
                {r === "ALL" ? "All" : r}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {users.length === 0 ? (
        <EmptyState
          title="No users match this filter"
          description="Try a different search term or role filter."
          action={
            <Link href="/admin/users">
              <Button variant="ghost">Clear filters</Button>
            </Link>
          }
        />
      ) : (
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
      )}
    </main>
  );
}
