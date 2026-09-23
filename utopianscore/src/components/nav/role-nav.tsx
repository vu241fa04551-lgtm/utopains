"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { clsx } from "@/lib/clsx";

interface NavLink {
  href: string;
  label: string;
}

// Shared nav shell for the three role areas. Desktop shows a small,
// intentionally short link list inline (per "few decisions on the
// surface" — this is not a mega-sidebar). Mobile collapses into a
// real hamburger menu rather than just shrinking the desktop layout.
export function RoleNav({ title, links }: { title: string; links: NavLink[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b border-ink-100 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-ink-900">{title}</span>
          <div className="hidden items-center gap-5 sm:flex">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "text-sm transition",
                    active
                      ? "font-medium text-ink-900"
                      : "text-ink-700 hover:text-ink-900"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden sm:block">
          <SignOutButton />
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-ink-700 hover:bg-ink-100 sm:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M3 5h14M3 10h14M3 15h14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div
          id="mobile-nav-panel"
          className="border-t border-ink-100 px-6 py-3 sm:hidden"
        >
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-ink-700"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2">
              <SignOutButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
