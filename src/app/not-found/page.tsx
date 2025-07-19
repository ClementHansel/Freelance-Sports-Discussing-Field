"use client";

import NotFound from "@/components/not-found/NotFound";
import { Suspense } from "react";

export default function NotFoundPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-2">Search Results</h1>
      <Suspense
        fallback={<p className="text-muted-foreground">Loading search…</p>}
      >
        {/* this child is purely client‑side */}
        <NotFound />
      </Suspense>
    </div>
  );
}
