// src/components/forum/forum.tsx
"use client";
import React, { useState } from "react";

import { useCategories } from "@/hooks/useCategories";
import { ReportModal } from "./forum/ReportModal";
import { ForumHeader } from "./forum/ForumHeader";
import { SortedTopicTabs } from "./forum/SortedTopicTabs";
import { CategoriesGrid } from "./forum/CategoriesGrid";

export default function Forum() {
  const [reportState, setReportState] = useState<{
    isOpen: boolean;
    topicId?: string;
  }>({ isOpen: false });
  const { data: level1 } = useCategories(null, 1);
  const { data: level2 } = useCategories(undefined, 2);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ForumHeader />

      <SortedTopicTabs
        onReport={(id) => setReportState({ isOpen: true, topicId: id })}
      />

      <CategoriesGrid title="Browse Main Forums" forums={level1 || []} />
      <CategoriesGrid
        title="Browse Province / State"
        forums={level2 || []}
        groupByCountry
      />

      <ReportModal
        isOpen={reportState.isOpen}
        onClose={() => setReportState({ isOpen: false })}
        topicId={reportState.topicId}
        contentType="topic"
      />
    </div>
  );
}
