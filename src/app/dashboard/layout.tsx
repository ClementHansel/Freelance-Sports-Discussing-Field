"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  Home,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Flag,
  Search,
  AlertTriangle,
  DollarSign,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";

const NAV_ITEMS = [
  {
    path: "/dashboard/admin",
    label: "Dashboard",
    icon: BarChart3,
    roles: ["admin", "superadmin"],
  },
  {
    path: "/dashboard/admin/users",
    label: "Users",
    icon: Users,
    roles: ["admin", "superadmin"],
  },
  {
    path: "/dashboard/staff/content",
    label: "Content",
    icon: MessageSquare,
    roles: ["staff", "superadmin"],
  },
  {
    path: "/dashboard/moderator",
    label: "Moderation",
    icon: Flag,
    roles: ["moderator", "superadmin"],
  },
  {
    path: "/dashboard/staff/spam",
    label: "Spam Management",
    icon: AlertTriangle,
    roles: ["staff", "superadmin"],
  },
  {
    path: "/dashboard/admin/ads",
    label: "Advertising",
    icon: DollarSign,
    roles: ["admin", "superadmin"],
  },
  {
    path: "/dashboard/admin/seo",
    label: "SEO",
    icon: Search,
    roles: ["admin", "superadmin"],
  },
  {
    path: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    roles: ["admin", "moderator", "staff", "superadmin"],
  },
  {
    path: "/dashboard/users",
    label: "My Profile",
    icon: Shield,
    roles: ["user"],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) return <div className="p-6">Loading...</div>;

  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  const renderNavLinks = () =>
    visibleNav.map(({ path, label, icon: Icon }) => {
      const isActive = pathname === path;
      return (
        <Link
          key={path}
          href={path}
          onClick={() => setMobileOpen(false)} // auto-close drawer
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <Icon className="h-4 w-4" />
          {!collapsed && <span>{label}</span>}
        </Link>
      );
    });

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 fixed top-0 inset-x-0 bg-white border-b shadow-sm z-30 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/" className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            <span className="font-medium text-gray-800 hidden sm:inline">
              Back to Forum
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-500" />
          <span className="font-semibold hidden sm:inline">
            Dashboard Panel
          </span>
        </div>
      </header>

      {/* Layout Body */}
      <div className="flex flex-1 pt-14 overflow-hidden">
        {/* Sidebar Desktop */}
        <aside
          className={cn(
            "bg-white border-r hidden md:flex flex-col transition-all duration-300 overflow-y-auto",
            collapsed ? "w-16" : "w-64"
          )}
        >
          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start mb-4 text-xs"
              onClick={() => setCollapsed((prev) => !prev)}
            >
              {collapsed ? "→" : "← Collapse"}
            </Button>
            <nav className="space-y-2">{renderNavLinks()}</nav>
          </div>
        </aside>

        {/* Sidebar Mobile Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 flex md:hidden">
            <div className="w-64 bg-white h-full shadow-lg p-4 relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                className="absolute top-2 right-2"
              >
                <X className="h-5 w-5" />
              </Button>
              <nav className="mt-8 space-y-2">{renderNavLinks()}</nav>
            </div>
            <div className="flex-1" onClick={() => setMobileOpen(false)} />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-muted p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="h-10 bg-white border-t px-4 flex items-center justify-center text-sm fixed bottom-0 left-0 right-0 z-10">
        © {new Date().getFullYear()} Rev Sports
      </footer>
    </div>
  );
}
