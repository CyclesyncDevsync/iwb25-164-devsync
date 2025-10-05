import { useState, useEffect } from "react";
import { User } from "../types/user";

interface CachedUserResponse {
  data: User;
  cached: boolean;
  source: "redis" | "fresh";
}

/**
 * Custom hook to fetch user profile with Redis caching
 * This reduces database queries and improves sidebar loading performance
 */
export function useCachedUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const fetchCachedUser = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/cached-profile", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setUser(null);
          return;
        }
        throw new Error("Failed to fetch user profile");
      }

      const result: CachedUserResponse = await response.json();
      setUser(result.data);
      setFromCache(result.cached);

      if (result.cached) {
        console.log("✅ User profile loaded from Redis cache");
      } else {
        console.log("🔄 User profile fetched fresh and cached");
      }
    } catch (err) {
      console.error("Error fetching cached user:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      await fetch("/api/user/cached-profile", {
        method: "DELETE",
        credentials: "include",
      });
      console.log("🗑️ User cache cleared");
      // Fetch fresh data
      await fetchCachedUser();
    } catch (err) {
      console.error("Error clearing cache:", err);
    }
  };

  const refreshUser = async () => {
    await clearCache();
  };

  useEffect(() => {
    fetchCachedUser();
  }, []);

  return {
    user,
    loading,
    error,
    fromCache,
    refreshUser,
    clearCache,
  };
}
