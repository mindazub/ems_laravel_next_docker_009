"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { clearAuthSession, getAuthSession } from "@/lib/auth";

type NavItem = {
  href: string;
  label: string;
  roles: Array<"admin" | "staff" | "manager" | "installer" | "customer">;
};

const navItems: NavItem[] = [
  { href: "/plants", label: "Plants", roles: ["admin", "staff", "manager", "installer", "customer"] },
  { href: "/diagrams", label: "Diagrams", roles: ["admin", "staff", "manager", "installer", "customer"] },
  { href: "/reports", label: "Reports", roles: ["admin", "staff", "manager"] },
  { href: "/staff/customers", label: "Customers", roles: ["admin", "staff"] },
  { href: "/admin/user-plants", label: "Plant Approvals", roles: ["admin", "staff"] },
  { href: "/admin/queue", label: "Queue Monitor", roles: ["admin", "staff"] },
  { href: "/admin/analytics", label: "Analytics", roles: ["admin", "staff"] },
  { href: "/admin/translations", label: "Translations", roles: ["admin", "staff"] },
  { href: "/admin/docs", label: "Docs Admin", roles: ["admin", "staff"] },
  { href: "/admin/api-docs", label: "API Docs", roles: ["admin", "staff"] },
  { href: "/docs", label: "Documentation", roles: ["admin", "staff", "manager", "installer", "customer"] },
  { href: "/settings", label: "Settings", roles: ["admin", "staff", "manager", "installer", "customer"] },
  { href: "/admin/activity", label: "Admin Activity", roles: ["admin", "staff"] },
  { href: "/admin/users", label: "Users", roles: ["admin", "staff"] },
];

export function EmsShell({ children, title }: { children: React.ReactNode; title: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<"admin" | "staff" | "manager" | "installer" | "customer">(() => {
    const session = getAuthSession();
    return session?.user.role ?? "admin";
  });
  const [dark, setDark] = useState(false);
  const [useBrandFont, setUseBrandFont] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.token) {
      router.replace("/auth/login");
      return;
    }
  }, [router]);

  const filtered = useMemo(() => navItems.filter((item) => item.roles.includes(role)), [role]);

  const handleLogout = async () => {
    try {
      await apiPost("/auth/logout");
    } catch {
    }

    clearAuthSession();
    router.push("/auth/login");
  };

  return (
    <div className={dark ? "dark" : ""}>
      <div className={`min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 ${useBrandFont ? "font-brand" : "font-sans"}`}>
        <div className="grid min-h-screen grid-cols-[280px_1fr]">
          <aside className="border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-3">
              <Image src="/brand/edis-logo.svg" alt="EDIS" width={160} height={38} priority />
            </div>
            <div className="mb-4 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</label>
              <select value={role} onChange={(event) => setRole(event.target.value as typeof role)} className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800">
                <option value="admin">admin</option>
                <option value="staff">staff</option>
                <option value="manager">manager</option>
                <option value="installer">installer</option>
                <option value="customer">customer</option>
              </select>
            </div>
            <nav className="space-y-2">
              {filtered.map((item) => (
                <Link key={item.href} href={item.href} className={`block rounded-md px-3 py-2 text-sm ${pathname.startsWith(item.href) ? "bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 space-y-2 text-xs text-slate-500">
              <button className="w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-700" onClick={() => setDark((prev) => !prev)}>
                Toggle {dark ? "Light" : "Dark"}
              </button>
              <button className="w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-700" onClick={() => setUseBrandFont((prev) => !prev)}>
                Toggle {useBrandFont ? "Default" : "Arial Nova"} font
              </button>
              <button className="w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-700" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </aside>
          <main className="p-6">
            <header className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h1 className="text-2xl font-semibold">{title}</h1>
              <div className="text-sm text-slate-500">EMS parity workspace</div>
            </header>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
