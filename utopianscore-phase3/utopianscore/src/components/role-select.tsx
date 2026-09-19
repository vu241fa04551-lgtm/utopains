"use client";

import { useState, useTransition } from "react";
import { updateUserRole } from "@/app/actions/admin";
import { Role } from "@prisma/client";
import { clsx } from "@/lib/clsx";

export function RoleSelect({ userId, role }: { userId: string; role: Role }) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  return (
    <div className="text-right">
      <select
        defaultValue={role}
        disabled={isPending}
        aria-label="Change user role"
        onChange={(e) => {
          const next = e.target.value as Role;
          setFeedback(null);
          startTransition(async () => {
            const result = await updateUserRole(userId, next);
            setFeedback(result);
          });
        }}
        className="rounded-lg border border-ink-100 bg-white px-2 py-1 text-xs text-ink-700 disabled:opacity-50"
      >
        <option value="STUDENT">STUDENT</option>
        <option value="FACULTY">FACULTY</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      {feedback && (
        <p
          role={feedback.ok ? "status" : "alert"}
          className={clsx("mt-1 text-xs", feedback.ok ? "text-emerald-700" : "text-red-600")}
        >
          {feedback.message}
        </p>
      )}
    </div>
  );
}
