import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL || "https://rscowwmoeycyxmfslhme.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getForumSetting(key: string, fallback: string) {
  try {
    if (!supabaseUrl || !supabaseAnonKey)
      throw new Error(
        "Missing Supabase environment variables (SUPABASE_URL or SUPABASE_ANON_KEY)"
      );

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
