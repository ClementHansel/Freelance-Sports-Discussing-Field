"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { useUser } from "@/hooks/useUser";

function DashboardRedirect() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
    } else {
      // Role-based redirect
      const role = user.role;

      if (role === "superadmin" || role === "admin") {
        router.push("/dashboard/admin");
      } else if (role === "moderator") {
        router.push("/dashboard/moderator");
      } else if (role === "staff") {
        router.push("/dashboard/staff");
      } else {
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

export default function DashboardRootPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      }
    >
      <DashboardRedirect />
    </Suspense>
  );
}
