"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { clearAuthSession } from "@/lib/auth";

type NavItem = {
  href: string;
  label: string;
  icon?: string;
  roles: Array<"admin" | "staff" | "manager" | "installer" | "customer">;
};

const AUTH_STORAGE_KEY = "ems.auth.session";

function subscribeAuthSession(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listener = () => onStoreChange();
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener("storage", listener);
  };
}

function getAuthSessionSnapshot() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(AUTH_STORAGE_KEY) ?? "";
}

const navItems: NavItem[] = [
  { href: "/plants", label: "My Plants", icon: "/brand/icons/plants.png", roles: ["customer"] },
  { href: "/reports", label: "Reports", icon: "/brand/icons/document.png", roles: ["customer"] },
  { href: "/plants", label: "Plants", icon: "/brand/icons/plants.png", roles: ["admin", "staff", "manager", "installer"] },
  { href: "/diagrams", label: "Diagrams", icon: "/brand/icons/controllers.png", roles: ["admin", "staff", "manager", "installer", "customer"] },
  { href: "/reports", label: "Reports", icon: "/brand/icons/document.png", roles: ["admin", "staff", "manager"] },
  { href: "/staff/customers", label: "Customers", icon: "/brand/icons/customers.png", roles: ["admin", "staff"] },
  { href: "/admin/user-plants", label: "Plant Approvals", icon: "/brand/icons/controllers.png", roles: ["admin", "staff"] },
  { href: "/admin/queue", label: "Queue Monitor", icon: "/brand/icons/monitoring.png", roles: ["admin", "staff"] },
  { href: "/admin/analytics", label: "Analytics", icon: "/brand/icons/analytics.png", roles: ["admin", "staff"] },
  { href: "/admin/translations", label: "Translations", icon: "/brand/icons/translations.png", roles: ["admin", "staff"] },
  { href: "/admin/plant-name-mappings", label: "Plant Name Mappings", icon: "/brand/icons/document.png", roles: ["admin"] },
  { href: "/admin/docs", label: "Docs Admin", icon: "/brand/icons/document.png", roles: ["admin", "staff"] },
  { href: "/admin/api-docs", label: "API Docs", icon: "/brand/icons/document.png", roles: ["admin", "staff"] },
  { href: "/docs", label: "Documentation", icon: "/brand/icons/document.png", roles: ["admin", "staff", "manager", "installer", "customer"] },
  { href: "/settings", label: "Settings", icon: "/brand/icons/settings.png", roles: ["admin", "staff", "manager", "installer", "customer"] },
  { href: "/admin/activity", label: "Admin Activity", icon: "/brand/icons/activity.png", roles: ["admin", "staff"] },
  { href: "/admin/users", label: "Users", icon: "/brand/icons/team.png", roles: ["admin", "staff"] },
];

export function EmsShell({ children, title }: { children: React.ReactNode; title: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const authSessionRaw = useSyncExternalStore(
    subscribeAuthSession,
    getAuthSessionSnapshot,
    () => "",
  );
  const session = useMemo(() => {
    if (!authSessionRaw) {
      return null;
    }

    try {
      return JSON.parse(authSessionRaw) as { token: string; user: { name: string; email: string; role?: "admin" | "staff" | "manager" | "installer" | "customer" } };
    } catch {
      return null;
    }
  }, [authSessionRaw]);
  const role = session?.user.role ?? "customer";
  const [dark, setDark] = useState(false);
  const [useBrandFont, setUseBrandFont] = useState(false);

  useEffect(() => {
    if (!session?.token) {
      router.replace("/auth/login");
    }
  }, [router, session?.token]);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      root.classList.remove("light");
      window.localStorage.setItem("ems.theme", "dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      window.localStorage.setItem("ems.theme", "light");
    }
  }, [dark]);

  const filtered = navItems.filter((item) => item.roles.includes(role));
  const userName = session?.user.name ?? "User";
  const userInitials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    try {
      await apiPost("/auth/logout");
    } catch {
    }

    clearAuthSession();
    router.push("/auth/login");
  };

  return (
    <div className={`min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 ${useBrandFont ? "font-brand" : "font-sans"}`}>
        <div className="grid min-h-screen grid-cols-[280px_1fr]">
          <aside className="flex flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-3">
              <Image src="/brand/edis-logo.svg" alt="EDIS" width={160} height={38} priority className="h-auto w-auto" />
            </div>
            <nav className="space-y-2">
              {filtered.map((item) => (
                <Link key={item.href} href={item.href} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${pathname.startsWith(item.href) ? "bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                  {item.icon ? (
                    <Image src={item.icon} alt="" width={18} height={18} className="h-[18px] w-[18px] object-contain opacity-80" aria-hidden />
                  ) : null}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-auto pt-6 text-xs text-slate-500">
              <div className="mb-3 flex items-center gap-2 rounded-md border border-slate-200 p-2 dark:border-slate-700">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                  {userInitials || "U"}
                </div>
                <div className="truncate">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{userName}</div>
                  <div className="truncate text-[11px]">{session?.user.email}</div>
                </div>
              </div>
              <button className="mb-2 w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-700" onClick={() => setDark((prev) => !prev)}>
                Toggle {dark ? "Light" : "Dark"}
              </button>
              <button className="mb-2 w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-700" onClick={() => setUseBrandFont((prev) => !prev)}>
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
  );
}
