"use client";

import { useState, useEffect } from "react";

// TEMP MOCK: You can replace this logic later with real auth
export function useUser() {
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timeout = setTimeout(() => {
      // Simulate a logged-in user (adjust role as needed)
      setUser({ role: "superadmin" });
      setLoading(false);
    }, 500); // simulate 500ms delay

    return () => clearTimeout(timeout);
  }, []);

  return { user, loading };
}
