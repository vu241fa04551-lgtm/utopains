import { RoleNav } from "@/components/nav/role-nav";

const links = [
  { href: "/admin/dashboard", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/courses", label: "Courses" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-100/40">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>
      <RoleNav title="UtopianScore Admin" links={links} />
      <div id="main-content">{children}</div>
    </div>
  );
}
