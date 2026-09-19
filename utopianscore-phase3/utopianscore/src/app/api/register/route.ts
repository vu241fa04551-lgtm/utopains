import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

const registerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(200),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a valid name, email, and a password of at least 8 characters." },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Public registration is always STUDENT. Role is never accepted
  // from the request body.
  await prisma.user.create({
    data: { name, email, passwordHash, role: Role.STUDENT },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
