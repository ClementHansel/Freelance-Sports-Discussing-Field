"use client";
import Seo from "@/components/dashboard/admin/seo/Seo";
import { Suspense } from "react";

export default function AdminSeoPage() {
  <Suspense fallback={<div>Loading SEO Management...</div>}>
    <Seo />
  </Suspense>;
}
