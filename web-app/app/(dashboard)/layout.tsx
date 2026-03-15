"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { authApi } from "@/lib/api";
import { GraduationCap, LayoutDashboard, BookOpen, TrendingUp, Search, Zap } from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={15} /> },
  { href: "/chapters",  label: "Chapters",  icon: <BookOpen size={15} /> },
  { href: "/progress",  label: "Progress",  icon: <TrendingUp size={15} /> },
  { href: "/search",    label: "Search",    icon: <Search size={15} /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    const refresh = typeof window !== "undefined"
      ? localStorage.getItem("refresh_token") ?? ""
      : "";
    try { await authApi.logout(refresh); } catch { /* ignore */ }
    logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#030712]">

      {/* ── Top nav ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#030712]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/30">
              <GraduationCap size={13} className="text-white" />
            </div>
            <span className="font-bold text-white text-sm hidden sm:block">
              Course<span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Companion</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex gap-1">
            {NAV_LINKS.map(({ href, label, icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                    active
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-gray-400 hover:text-white hover:bg-white/5",
                  ].join(" ")}
                >
                  {icon}
                  <span className="hidden sm:block">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User area */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {user && (
              <span className="text-xs text-gray-500 hidden md:block truncate max-w-[140px]">
                {user.email}
              </span>
            )}
            {user?.tier === "pro" ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30">
                Pro
              </span>
            ) : (
              <Link
                href="/upgrade"
                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-yellow-400 border border-yellow-500/20 hover:from-yellow-500/20 hover:to-orange-500/20 transition"
              >
                <Zap size={10} />
                Upgrade
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Page content ──────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {children}
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-4 text-center text-xs text-gray-700">
        Course Companion FTE · Generative AI Fundamentals · Powered by Claude
      </footer>
    </div>
  );
}
