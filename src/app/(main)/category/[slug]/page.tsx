"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCategories } from "@/hooks/useCategories";
import { useTopics } from "@/hooks/useTopics";
import { Card } from "@/components/ui/card";
import { PostCard } from "@/components/forum/forum/PostCard";
import { HotTopic } from "@/hooks/useHotTopics";

export default function CategoryPage() {
  const { slug } = useParams() as { slug: string };
  const { data: categories, isLoading: catsLoading } = useCategories(null, 0);
  const category = categories?.find((c) => c.slug === slug);

  const { data: topicResult, isLoading: topicsLoading } = useTopics(
    category?.id
  );

  const topics = topicResult?.data ?? [];

  if (catsLoading) {
    return <p>Loading category…</p>;
  }

  if (!category) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-lg font-semibold">Category not found</h2>
        <Link href="/" className="text-blue-600 hover:underline">
          Back to forum
        </Link>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
      </Card>

      {topicsLoading ? (
        <p>Loading topics…</p>
      ) : topics.length > 0 ? (
        <div className="space-y-4">
          {topics.map((t) => {
            const topic: HotTopic = {
              id: t.id,
              title: t.title,
              content: t.content ?? "",
              slug: t.slug,
              category_id: t.category_id,
              created_at: t.created_at ?? "",
              updated_at: t.updated_at ?? "",
              author_id: t.author_id ?? "",
              reply_count: t.reply_count ?? 0,
              view_count: t.view_count ?? 0,
              last_reply_at: t.last_reply_at ?? "",
              last_post_id: t.last_post_id ?? null,

              username: t.author_username ?? "",
              avatar_url: t.author_avatar_url ?? "",
              category_name: t.category_name ?? "",
              category_color: t.category_color ?? "",
              category_slug: t.category_slug ?? "",
              is_pinned: false, // Default - update if needed
              is_locked: false, // Default - update if needed
              hot_score: 0, // Default - update if needed
              parent_category_slug: "", // Default - update if needed
              parent_category_id: "",
            };

            return <PostCard key={topic.id} topic={topic} />;
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">No topics yet</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to start a discussion in “{category.name}”!
          </p>
          <Link
            href="/create"
            className="text-white bg-blue-600 px-4 py-2 rounded-md"
          >
            Create Topic
          </Link>
        </Card>
      )}
    </div>
  );
}
