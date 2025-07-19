// src/app/dashboard/DashboardRedirect.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { useUser } from "@/hooks/useUser";

export default function DashboardRedirect() {
  const router = useRouter();
  const { user, loading } = useUser();
  useEffect(() => {
    if (!loading) {
      if (!user) return router.push("/login");
      if (["admin", "superadmin"].includes(user.role))
        return router.push("/dashboard/admin");
      if (user.role === "moderator") return router.push("/dashboard/moderator");
      if (user.role === "staff") return router.push("/dashboard/staff");
      router.push("/dashboard/users");
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">Redirecting…</p>
    </div>
  );
}
