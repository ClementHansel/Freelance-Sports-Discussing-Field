// src/types/forum.ts
import type { Database } from "@/components/integrations/supabase/types";

type TopicRow = Database["public"]["Tables"]["topics"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type TopicWithExtras = TopicRow & {
  categories?: Pick<CategoryRow, "name" | "slug"> | null;
  profiles?: Pick<ProfileRow, "username"> | null;
};
