// hooks/useModerationItems.ts
import { supabase } from "@/components/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Define ModerationItem interface if not already global
interface ModerationItem {
  id: string;
  type: "topic" | "post";
  title: string;
  content: string;
  author: string;
  created_at: string;
  reported_count: number;
  status: "pending" | "approved" | "rejected";
  is_anonymous?: boolean;
  ip_address?: string | null;
  slug?: string;
  category_slug?: string;
  topic_id?: string;
  topic_slug?: string;
}

type ModerationStatus = "pending" | "approved" | "rejected";

export const useModerationItems = (status: ModerationStatus = "pending") => {
  return useQuery<ModerationItem[], Error>({
    queryKey: ["moderationItems", status],
    queryFn: async () => {
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select(
          `
          id,
          title,
          content,
          created_at,
          status,
          is_anonymous,
          ip_address,
          slug,
          categories(slug, name),
          profiles(username)
        `
        )
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (topicsError) throw new Error(topicsError.message);

      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(
          `
          id,
          content,
          created_at,
          status,
          is_anonymous,
          ip_address,
          topics(id, title, slug, categories(slug, name)),
          profiles(username)
        `
        )
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (postsError) throw new Error(postsError.message);

      const combinedItems: ModerationItem[] = [];

      topicsData.forEach((topic) => {
        combinedItems.push({
          id: topic.id,
          type: "topic",
          title: topic.title,
          content: topic.content,
          author: topic.profiles?.username || "Anonymous User",
          created_at: topic.created_at,
          reported_count: 0, // You might need to fetch this separately or adjust your schema
          status: topic.status as ModerationStatus,
          is_anonymous: topic.is_anonymous || false,
          ip_address: topic.ip_address,
          slug: topic.slug,
          category_slug: topic.categories?.slug || "",
        });
      });

      postsData.forEach((post) => {
        combinedItems.push({
          id: post.id,
          type: "post",
          title: `Re: ${post.topics?.title || "Unknown Topic"}`, // Derive title for posts
          content: post.content,
          author: post.profiles?.username || "Anonymous User",
          created_at: post.created_at,
          reported_count: 0, // You might need to fetch this separately or adjust your schema
          status: post.status as ModerationStatus,
          is_anonymous: post.is_anonymous || false,
          ip_address: post.ip_address,
          topic_id: post.topics?.id,
          topic_slug: post.topics?.slug,
          category_slug: post.topics?.categories?.slug || "",
        });
      });

      // Sort by creation date if desired, or handle in query
      return combinedItems.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
  });
};
