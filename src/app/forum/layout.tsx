// src/app/forum/layout.tsx
"use client";

import { ForumLayout } from "@/components/layout/ForumLayout";

export default function ForumLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ForumLayout>{children}</ForumLayout>;
}
