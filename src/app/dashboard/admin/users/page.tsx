"use client";

import React from "react";
import { UserManagement } from "@/components/dashboard/admin/user/UserManagement";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-2">
          View, manage roles, edit profiles, and ban users.
        </p>
      </div>
      <UserManagement />
    </div>
  );
}
