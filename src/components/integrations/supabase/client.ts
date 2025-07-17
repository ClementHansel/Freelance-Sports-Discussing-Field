// src/types/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

const SUPABASE_URL = "https://rscowwmoeycyxmfslhme.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzY293d21vZXljeXhtZnNsaG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTMyNTQsImV4cCI6MjA2NzA2OTI1NH0.qUsm6rt8cPME0Xe8ctUGgXkYufZ8zS-pE0QBh9GLGhQ";

// Only use localStorage in the browser
const isBrowser = typeof window !== "undefined";

export const supabase = createBrowserClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: isBrowser ? localStorage : undefined,
      persistSession: isBrowser,
      autoRefreshToken: isBrowser,
    },
  }
);
