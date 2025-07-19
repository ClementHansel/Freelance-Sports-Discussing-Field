// src/app/(main)/search/page.tsx
import SearchClient from "@/components/search/SearchClient";
import React, { Suspense } from "react";

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-2">Search Results</h1>
      <Suspense
        fallback={<p className="text-muted-foreground">Loading search…</p>}
      >
        {/* this child is purely client‑side */}
        <SearchClient />
      </Suspense>
    </div>
  );
}
