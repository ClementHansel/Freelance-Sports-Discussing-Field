// src/components/forum/forum/SortedTopicTabs.tsx
"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessageSquare, TrendingUp, Star, Clock } from "lucide-react";
import { useTopics } from "@/hooks/useTopics";
import { useMostCommentedTopics } from "@/hooks/useMostCommentedTopics";
import { useMostViewedTopics } from "@/hooks/useMostViewedTopics";
import type { HotTopic, PaginatedHotTopicsResult } from "@/hooks/useHotTopics";
import { PostCard } from "@/components/forum/forum/PostCard";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface SortedTopicTabsProps {
  onReport?: (topicId: string) => void;
}

interface QueryResult<T> {
  data?: T;
  isLoading: boolean;
}

export function SortedTopicTabs({ onReport }: SortedTopicTabsProps) {
  const router = useRouter();
  const params = useSearchParams();
  const initialSort = params.get("sort") || "new";
  const [sortBy, setSortBy] = useState<string>(initialSort);

  const [hotPage, setHotPage] = useState(1);
  const [newPage, setNewPage] = useState(1);
  const [topPage, setTopPage] = useState(1);

  const hotQuery = useMostCommentedTopics(
    hotPage,
    10
  ) as QueryResult<PaginatedHotTopicsResult>;
  const newQuery = useTopics(
    undefined,
    newPage,
    10
  ) as QueryResult<PaginatedHotTopicsResult>;
  const topQuery = useMostViewedTopics(
    topPage,
    10
  ) as QueryResult<PaginatedHotTopicsResult>;

  const handleSortChange = (value: string) => {
    setSortBy(value);
    const qs = new URLSearchParams(params.toString());
    if (value === "new") qs.delete("sort");
    else qs.set("sort", value);
    router.push(`?${qs.toString()}`);
    setHotPage(1);
    setNewPage(1);
    setTopPage(1);
  };

  const renderTab = (
    query: QueryResult<PaginatedHotTopicsResult>,
    page: number,
    setPage: (n: number) => void
  ) => {
    if (query.isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse" />
          ))}
        </div>
      );
    }

    const items = query.data?.data ?? [];
    const totalPages = query.data?.totalPages ?? 1;
    const totalCount = query.data?.totalCount ?? 0;

    if (items.length === 0) {
      return (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p>No posts yet</p>
        </div>
      );
    }

    return (
      <>
        <div className="space-y-4">
          {items.map((t: HotTopic) => (
            <PostCard key={t.id} topic={t} onReport={onReport} />
          ))}
        </div>
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalCount}
          itemsPerPage={10}
          onPageChange={setPage}
          loading={query.isLoading}
        />
      </>
    );
  };

  return (
    <Tabs value={sortBy} onValueChange={handleSortChange}>
      <TabsList className="grid grid-cols-3">
        <TabsTrigger value="new" className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>New</span>
        </TabsTrigger>
        <TabsTrigger value="hot" className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4" />
          <span>Hot</span>
        </TabsTrigger>
        <TabsTrigger value="top" className="flex items-center space-x-2">
          <Star className="h-4 w-4" />
          <span>Top</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="new" className="space-y-4">
        {renderTab(newQuery, newPage, setNewPage)}
      </TabsContent>
      <TabsContent value="hot" className="space-y-4">
        {renderTab(hotQuery, hotPage, setHotPage)}
      </TabsContent>
      <TabsContent value="top" className="space-y-4">
        {renderTab(topQuery, topPage, setTopPage)}
      </TabsContent>
    </Tabs>
  );
}
