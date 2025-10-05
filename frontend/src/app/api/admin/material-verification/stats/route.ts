import { NextRequest, NextResponse } from "next/server";
import { cache } from "@/lib/redis";

/**
 * GET /api/admin/material-verification/stats
 * Get material verification statistics with Redis caching
 * Cache TTL: 2 minutes (120 seconds) - Increased for faster perceived performance
 */
export async function GET(request: NextRequest) {
  try {
    const cacheKey = "admin:material-verification:stats";

    // Try to get from cache first
    const cachedStats = await cache.get(cacheKey);

    if (cachedStats) {
      console.log(
        "✅ Cache HIT for material verification stats - INSTANT LOAD"
      );
      return NextResponse.json({
        data: cachedStats,
        cached: true,
        source: "redis",
        timestamp: new Date().toISOString(),
      });
    }

    console.log(
      "⚠️ Cache MISS for material verification stats - Calculating..."
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

    // Calculate statistics
    const stats = {
      totalSubmissions: submissions.length,
      agentVisits: submissions.filter(
        (s: any) => s.delivery_method === "agent_visit"
      ).length,
      dropOffs: submissions.filter((s: any) => s.delivery_method === "drop_off")
        .length,
      pendingVerifications: submissions.filter(
        (s: any) => s.submission_status === "pending_verification"
      ).length,
      verified: submissions.filter(
        (s: any) => s.submission_status === "verified"
      ).length,
      rejected: submissions.filter(
        (s: any) => s.submission_status === "rejected"
      ).length,
    };

    // Store in cache for 2 minutes (120 seconds) - Increased for faster perceived performance
    await cache.set(cacheKey, stats, 120);

    return NextResponse.json({
      data: stats,
      cached: false,
      source: "fresh",
    });
  } catch (error) {
    console.error("Error fetching material verification stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/material-verification/stats
 * Clear statistics cache
 */
export async function DELETE(request: NextRequest) {
  try {
    const cacheKey = "admin:material-verification:stats";
    await cache.del(cacheKey);
    console.log("🗑️ Cleared material verification stats cache");

    return NextResponse.json({
      success: true,
      message: "Statistics cache cleared",
    });
  } catch (error) {
    console.error("Error clearing stats cache:", error);
    return NextResponse.json(
      { error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}
