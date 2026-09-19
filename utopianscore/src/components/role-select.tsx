"use client";

import { useTransition } from "react";
import { updateUserRole } from "@/app/actions/admin";
import { Role } from "@prisma/client";

// Server Actions can be called directly from a Client Component, but
// a bare onChange handler cannot live inside a Server Component — so
// this small island is the interactive boundary for the admin
// user-role dropdown.
export function RoleSelect({ userId, role }: { userId: string; role: Role }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={role}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as Role;
        startTransition(() => {
          updateUserRole(userId, next);
        });
      }}
      className="rounded-lg border border-ink-100 bg-white px-2 py-1 text-xs text-ink-700 disabled:opacity-50"
    >
      <option value="STUDENT">STUDENT</option>
      <option value="FACULTY">FACULTY</option>
      <option value="ADMIN">ADMIN</option>
    </select>
  );
}
