// src/app/dashboard/content/page.tsx
"use client";

import React, { Suspense } from "react";
import AdminContent from "@/components/dashboard/moderator/content/AdminContent";

export default function ModeratorDashboardPage() {
  return (
    <div className="space-y-10 p-6">
      <h2 className="text-xl font-semibold mb-4">Content Moderation</h2>
      <Suspense fallback={<div>Loading Admin Content...</div>}>
        <AdminContent />
      </Suspense>
    </div>
  );
}
