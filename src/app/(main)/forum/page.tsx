"use client";
import Forum from "@/components/forum/forum";
import { Suspense } from "react";

export default function ForumPage() {
  <Suspense fallback={<div>Loading Forum...</div>}>
    <Forum />
  </Suspense>;
}
