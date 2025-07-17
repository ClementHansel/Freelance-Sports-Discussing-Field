"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Loader } from "lucide-react";
import { useUser } from "@/hooks/useUser";

export default function DashboardRootPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
    } else {
      // Role-based redirect
      const role = user.role;

      if (role === "superadmin") {
        router.push("/dashboard/admin"); // entry point to all admin/mod/staff/settings
      } else if (role === "admin") {
        router.push("/dashboard/admin");
      } else if (role === "moderator") {
        router.push("/dashboard/moderator");
      } else if (role === "staff") {
        router.push("/dashboard/staff");
      } else {
        // fallback to public user dashboard
        router.push("/dashboard/users");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">
        Redirecting to your dashboard...
      </p>
    </div>
  );
}
