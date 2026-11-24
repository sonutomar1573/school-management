import Link from "next/link";
import { LayoutDashboard, BookOpen, Users, GraduationCap, FileSpreadsheet } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/classes", label: "Classes & Sections", icon: BookOpen },
  { href: "/admin/teachers", label: "Teachers", icon: Users },
  { href: "/admin/students", label: "Students", icon: GraduationCap },
  { href: "/admin/exams", label: "Exams & Results", icon: FileSpreadsheet },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <aside className="w-full md:w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col justify-between p-4">
        <div>
          <div className="px-4 py-3 mb-6">
            <h1 className="text-xl font-bold text-blue-600">SchoolChalo</h1>
            <p className="text-xs text-gray-500">Admin Portal</p>
          </div>
          <nav className="flex flex-wrap gap-1.5 md:block md:space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="border-t pt-4">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-y-auto min-w-0 overflow-x-hidden">{children}</main>
    </div>
  );
}
