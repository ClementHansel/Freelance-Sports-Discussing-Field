// src/app/dashboard/page.tsx
import DashboardRedirect from "@/components/dashboard/DashboardRedirect";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          Loading…
        </div>
      }
    >
      <DashboardRedirect />
    </Suspense>
  );
}
