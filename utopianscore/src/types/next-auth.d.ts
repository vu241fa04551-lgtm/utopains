import { Role } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

// Extends NextAuth's built-in types so `role` and `id` are known,
// typed fields on the session and JWT rather than untyped `any`.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: Role;
    };
  }

  interface User {
    id: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
