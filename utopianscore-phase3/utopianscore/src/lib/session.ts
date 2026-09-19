import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { Role } from "@prisma/client";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

// Server-side authorization guard. Every server component/action that
// touches role-restricted data calls this rather than trusting
// anything supplied by the client.
export async function requireRole(allowed: Role[]) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!allowed.includes(user.role as Role)) {
    redirect("/");
  }
  return user;
}
