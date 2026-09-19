"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Role } from "@prisma/client";
import type { ActionResult } from "@/lib/action-result";

export async function updateUserRole(userId: string, role: Role): Promise<ActionResult> {
  const admin = await requireRole([Role.ADMIN]);

  if (userId === admin.id) {
    return { ok: false, message: "You cannot change your own role." };
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");

  return { ok: true, message: `Role updated to ${role}.` };
}
