"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Activity, Award, GraduationCap, Gift, LogOut, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Home", title: "Home", icon: Home },
  { path: "/activities", label: "Activities", title: "Activities", icon: Activity },
  { path: "/badges", label: "Badges", title: "Badges", icon: Award },
  { path: "/masterclasses", label: "Masterclass", title: "Masterclass", icon: GraduationCap },
  { path: "/rewards", label: "Rewards", title: "Rewards", icon: Gift },
];

interface AppLayoutProps {
  children: React.ReactNode;
  user?: { name: string; plan?: string; course?: string } | null;
}

export default function AppLayout({ children, user }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const getCurrentPageTitle = () => {
    const currentItem = NAV_ITEMS.find((item) => item.path === pathname);
    return currentItem?.title || "Pulse Points";
  };

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/welcome");
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-border px-4 py-3 z-40 flex items-center justify-between">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-[#1A1A2E]"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <h1 className="text-base font-semibold text-[#1A1A2E] absolute left-1/2 -translate-x-1/2">
          {getCurrentPageTitle()}
        </h1>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block fixed top-0 left-64 right-0 bg-white border-b border-border z-30">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-lg font-semibold text-[#1A1A2E]">{getCurrentPageTitle()}</h1>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#073640] flex flex-col shadow-lg transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6 pt-8">
          <span className="text-white font-bold text-xl tracking-tight">
            Pulse <span className="text-[#62C8DF]">Points</span>
          </span>
        </div>

        {/* User Profile */}
        <Link
          href="/profile"
          onClick={() => setIsMobileMenuOpen(false)}
          className="w-full px-6 py-4 bg-[#05272e] hover:bg-[#05272e]/90 transition-colors text-left block"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#D8D8D8] flex items-center justify-center overflow-hidden flex-shrink-0">
              <svg className="w-full h-full" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="20" fill="#D8D8D8" />
                <circle cx="20" cy="15" r="7" fill="#999" />
                <path d="M8 35C8 28 13 23 20 23C27 23 32 28 32 35" fill="#999" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white text-sm truncate">
                {user?.name || "Marvel"}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-[#55AA2F] rounded-full" />
                <span className="text-white text-xs">{user?.plan || "Plan C"}</span>
              </div>
            </div>
          </div>
          <div className="mt-1">
            <p className="text-sm text-white">
              Course: <span className="text-[#5B8DB8]">{user?.course || "NEET PG"}</span>
            </p>
          </div>
        </Link>

        {/* Divider */}
        <div className="h-px bg-[#3E5157] mx-6 my-4" />

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full flex items-center gap-3 pl-6 pr-6 py-3 transition-colors relative ${
                  active ? "text-white hover:bg-white/10" : "text-[#72A1AB] hover:bg-white/10"
                }`}
              >
                {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />}
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="pb-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 pl-6 pr-6 py-3 text-[#72A1AB] hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-sm">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-20 lg:pl-64">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
