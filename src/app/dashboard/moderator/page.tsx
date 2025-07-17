"use client";

import { AdminModerationContent } from "@/components/dashboard/moderator/AdminModerationContent";
import React from "react";

export default function ModeratorDashboardPage() {
  return (
    <div className="space-y-10 p-6">
      <AdminModerationContent />
    </div>
  );
}
