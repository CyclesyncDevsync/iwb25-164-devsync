import { NextRequest, NextResponse } from "next/server";
import { cache } from "@/lib/redis";

/**
 * GET /api/admin/material-verification/submissions
 * Get material submissions with Redis caching
 * Cache TTL: 2 minutes (120 seconds) - Increased for faster perceived performance
 */
export async function GET(request: NextRequest) {
  try {
    const cacheKey = "admin:material-submissions:list";

    // Try to get from cache first
    const cachedSubmissions = await cache.get(cacheKey);

    if (cachedSubmissions) {
      console.log("✅ Cache HIT for material submissions list - INSTANT LOAD");
      return NextResponse.json({
        data: cachedSubmissions,
        cached: true,
        source: "redis",
        timestamp: new Date().toISOString(),
      });
    }

    console.log(
      "⚠️ Cache MISS for material submissions list - Fetching from backend..."
    );

    // Fetch from backend API
    const response = await fetch(
      "http://localhost:8080/api/test/material-submissions",
      {
        headers: {
          "Content-Type": "application/json",
        },
        // Add timeout to prevent long waits
        signal: AbortSignal.timeout(5000), // 5 second timeout
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch material submissions");
    }

    const data = await response.json();
    const submissions = data.data || [];

    // Store in cache for 2 minutes (120 seconds)
    await cache.set(cacheKey, submissions, 120);

    return NextResponse.json({
      data: submissions,
      cached: false,
      source: "fresh",
      count: submissions.length,
    });
  } catch (error) {
    console.error("Error fetching material submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/material-verification/submissions
 * Clear submissions cache
 */
export async function DELETE(request: NextRequest) {
  try {
    // Clear both submissions and stats cache
    await cache.del("admin:material-submissions:list");
    await cache.del("admin:material-verification:stats");
    await cache.del("admin:warehouse-stats");

    console.log("🗑️ Cleared all material verification caches");

    return NextResponse.json({
      success: true,
      message: "All caches cleared",
    });
  } catch (error) {
    console.error("Error clearing caches:", error);
    return NextResponse.json(
      { error: "Failed to clear caches" },
      { status: 500 }
    );
  }
}
