"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Role } from "@prisma/client";

export async function updateUserRole(userId: string, role: Role) {
  const admin = await requireRole([Role.ADMIN]);

  if (userId === admin.id) {
    throw new Error("You cannot change your own role.");
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });

  revalidatePath("/admin/users");
}
