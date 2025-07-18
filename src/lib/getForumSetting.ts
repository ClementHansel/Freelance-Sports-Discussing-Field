import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getForumSetting(key: string, fallback: string) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) throw new Error("Missing env vars");

    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", key)
      .single();

    if (error || !data?.value) return fallback;
    return data.value;
  } catch (e) {
    console.warn(`[getForumSetting] Fallback triggered for "${key}"`, e);
    return fallback;
  }
}
