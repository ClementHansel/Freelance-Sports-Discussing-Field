"use client";

import { AdminModerationContent } from "@/components/dashboard/moderator/AdminModerationContent";
import AdminContent from "@/components/dashboard/moderator/content/AdminContent";
import { SpamManagement } from "@/components/dashboard/moderator/spam/SpamManagement";
import React from "react";

export default function ModeratorDashboardPage() {
  return (
    <div className="space-y-10 p-6">
      <section>
        <h1 className="text-2xl font-bold mb-4">Moderation Overview</h1>
        <AdminModerationContent />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Content Moderation</h2>
        <AdminContent />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Spam Management</h2>
        <SpamManagement />
      </section>
    </div>
  );
}
