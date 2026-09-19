import { RoleNav } from "@/components/nav/role-nav";

const links = [
  { href: "/student/dashboard", label: "Home" },
  { href: "/student/courses", label: "Learn" },
  { href: "/student/practice", label: "Practice" },
  { href: "/student/progress", label: "Progress" },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-blue/40">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>
      <RoleNav title="UtopianScore" links={links} />
      <div id="main-content">{children}</div>
    </div>
  );
}
