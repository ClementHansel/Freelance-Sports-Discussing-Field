// src/hooks/moderation/useModerationItems.ts

import { supabase } from "@/components/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Database } from "@/components/integrations/supabase/types";

// Define the row types from your Supabase database for clarity
type TopicRow = Database["public"]["Tables"]["topics"]["Row"];
type PostRow = Database["public"]["Tables"]["posts"]["Row"];

// Define the exact shape of data returned by the 'topics' select query
type FetchedTopic = Pick<
  TopicRow,
  | "id"
  | "title"
  | "content"
  | "created_at"
  | "moderation_status"
  | "is_anonymous"
  | "ip_address"
  | "slug"
  | "category_id"
  | "author_id"
> & {
  categories: { slug: string; name: string } | null; // Corrected: categories is a single object or null, not an array
};

// Define the exact shape of data returned by the 'posts' select query
type FetchedPost = Pick<
  PostRow,
  | "id"
  | "content"
  | "created_at"
  | "moderation_status"
  | "is_anonymous"
  | "ip_address"
  | "topic_id"
  | "author_id"
> & {
  topics: {
    id: string;
    title: string;
    slug: string;
    categories: { slug: string; name: string } | null;
  } | null; // Corrected: topics.categories is a single object or null
};

// Define the structure of a ModerationItem, which combines data from topics and posts
// It includes properties that are consistent across both types of content.
export type ModerationItem = {
  id: string;
  type: "topic" | "post";
  title: string;
  content: string;
  author: string;
  created_at: string | null;
  reported_count: number; // This might need to be fetched separately if not a direct column
  status: "pending" | "approved" | "rejected"; // Unified status for the UI
  is_anonymous?: boolean;
  ip_address: string | null;
  slug?: string; // For topics
  category_slug?: string;
  topic_id?: string; // For posts, linking to their parent topic
  topic_slug?: string; // For posts, linking to their parent topic's slug
};

// Defines the possible moderation statuses used for filtering
type ModerationStatusFilter = "pending" | "approved" | "rejected";

export const useModerationItems = (
  filter: ModerationStatusFilter = "pending" // Renamed from 'status' to 'filter' for clarity and consistency
) => {
  return useQuery<ModerationItem[], Error>({
    queryKey: ["moderationItems", filter],
    queryFn: async (): Promise<ModerationItem[]> => {
      // Fetch topics with necessary nested relations
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select(
          `
          id,
          title,
          content,
          created_at,
          moderation_status,
          is_anonymous,
          ip_address,
          slug,
          category_id,
          categories(slug, name),
          author_id
        `
        )
        .eq("moderation_status", filter)
        .order("created_at", { ascending: false });

      if (topicsError) {
        console.error(
          "Error fetching topics for moderation:",
          topicsError.message
        );
      }

      // Fetch posts with necessary nested relations
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(
          `
          id,
          content,
          created_at,
          moderation_status,
          is_anonymous,
          ip_address,
          topic_id,
          topics(id, title, slug, categories(slug, name)),
          author_id
        `
        )
        .eq("moderation_status", filter)
        .order("created_at", { ascending: false });

      if (postsError) {
        console.error(
          "Error fetching posts for moderation:",
          postsError.message
        );
      }

      // Collect all unique author IDs from both topics and posts data
      const allAuthorIds = [
        ...(topicsData || []).map((t) => t.author_id),
        ...(postsData || []).map((p) => p.author_id),
      ].filter((id): id is string => id !== null); // Filter out null and ensure type is string

      // Fetch profiles for all unique author IDs
      const profilesMap = new Map<string, string>();
      if (allAuthorIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", Array.from(new Set(allAuthorIds))); // Use Set to get unique IDs

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError.message);
        } else {
          profiles?.forEach((profile) => {
            profilesMap.set(profile.id, profile.username);
          });
        }
      }

      // Helper function to get author name from the fetched profiles map
      const getAuthorName = (authorId: string | null) => {
        return authorId
          ? profilesMap.get(authorId) || "Anonymous User"
          : "Anonymous User";
      };

      // Helper function to map raw topic/post data to ModerationItem structure
      const mapModerationItem = (
        item: FetchedTopic | FetchedPost, // Use the newly defined precise types
        type: "topic" | "post"
      ): ModerationItem => {
        if (type === "topic") {
          const topic = item as FetchedTopic; // Cast to FetchedTopic
          return {
            id: topic.id,
            type: "topic",
            title: topic.title,
            content: topic.content || "",
            author: getAuthorName(topic.author_id),
            created_at: topic.created_at,
            reported_count: 0, // Default, adjust if you have a reporting system
            status: topic.moderation_status as ModerationStatusFilter, // Cast to ModerationStatusFilter
            is_anonymous: topic.is_anonymous || false,
            ip_address: topic.ip_address as string | null,
            slug: topic.slug,
            category_slug: topic.categories?.slug || "", // Corrected: Access slug directly
          };
        } else {
          const post = item as FetchedPost; // Cast to FetchedPost
          return {
            id: post.id,
            type: "post",
            title: `Re: ${post.topics?.title || "Unknown Topic"}`,
            content: post.content,
            author: getAuthorName(post.author_id),
            created_at: post.created_at,
            reported_count: 0, // Default, adjust if you have a reporting system
            status: post.moderation_status as ModerationStatusFilter, // Cast to ModerationStatusFilter
            is_anonymous: post.is_anonymous || false,
            ip_address: post.ip_address as string | null,
            topic_id: post.topic_id,
            topic_slug: post.topics?.slug,
            category_slug: post.topics?.categories?.slug || "", // Corrected: Access slug directly
          };
        }
      };

      const combinedItems: ModerationItem[] = [
        ...(topicsData || []).map((t) => mapModerationItem(t, "topic")),
        ...(postsData || []).map((p) => mapModerationItem(p, "post")),
      ];

      // Sort combined items by creation date
      return combinedItems.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );
    },
  });
};
