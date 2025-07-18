"use client";
import AdminUsers from "@/components/dashboard/admin/user/Users";
import { Suspense } from "react";

export default function AdminUserPage() {
  return (
    <Suspense fallback={<div>Loading Users Management..</div>}>
      <AdminUsers />
    </Suspense>
  );
}
