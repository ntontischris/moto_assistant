"use client";

import { createClient } from "@/lib/supabase/client";
import { BookOpen, HelpCircle, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Συνομιλίες", icon: LayoutDashboard },
  { href: "/dashboard/knowledge", label: "Knowledge Base", icon: BookOpen },
  { href: "/dashboard/unanswered", label: "Αναπάντητες", icon: HelpCircle },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="flex h-full w-64 flex-col border-r"
      style={{
        backgroundColor: "var(--gray-900)",
        borderColor: "var(--gray-700)",
      }}
    >
      {/* Logo header */}
      <div
        className="flex items-center gap-3 border-b px-5 py-5"
        style={{ borderColor: "var(--gray-700)" }}
      >
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: "var(--red)" }}
        >
          <span className="text-lg font-bold text-white">M</span>
        </div>
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--gray-100)" }}
        >
          Moto Assistant
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
              style={{
                backgroundColor: active ? "rgba(227, 25, 55, 0.1)" : undefined,
                color: active ? "var(--red)" : "var(--gray-300)",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "var(--gray-700)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        className="border-t px-3 py-4"
        style={{ borderColor: "var(--gray-700)" }}
      >
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
          style={{ color: "var(--gray-300)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--gray-700)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <LogOut size={18} />
          Αποσύνδεση
        </button>
      </div>
    </aside>
  );
}
