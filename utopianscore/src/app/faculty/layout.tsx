import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-violet/10">
      <nav className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-ink-900">UtopianScore Faculty</span>
            <Link href="/faculty/dashboard" className="text-sm text-ink-700 hover:text-ink-900">
              My courses
            </Link>
          </div>
          <SignOutButton />
        </div>
      </nav>
      {children}
    </div>
  );
}
