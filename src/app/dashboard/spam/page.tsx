"use client";
import { SpamManagement } from "@/components/dashboard/moderator/spam/SpamManagement";
import React, { Suspense } from "react";

export default function AdminSpamPage() {
  return (
    <Suspense fallback={<div>Loading Spam Management...</div>}>
      <SpamManagement />
    </Suspense>
  );
}
