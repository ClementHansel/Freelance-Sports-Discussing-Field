"use client";

import AdminContent from "@/components/dashboard/moderator/content/AdminContent";
import React from "react";

export default function ModeratorDashboardPage() {
  return (
    <div className="space-y-10 p-6">
      <h2 className="text-xl font-semibold mb-4">Content Moderation</h2>
      <AdminContent />
    </div>
  );
}
