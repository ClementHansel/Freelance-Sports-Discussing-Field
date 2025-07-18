"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const DynamicProfile = dynamic(
  () => import("@/components/dashboard/user/Profile"),
  { ssr: false }
);

export default function UserProfilePage() {
  return (
    <Suspense fallback={<div>Loading Profile...</div>}>
      <DynamicProfile />
    </Suspense>
  );
}
