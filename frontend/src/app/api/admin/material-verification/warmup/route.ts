import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/material-verification/warmup
 * Warms up all caches by fetching and caching data
 * Call this endpoint to pre-populate caches for faster subsequent loads
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🔥 Warming up caches...");
    const startTime = performance.now();

    // Trigger all cache endpoints in parallel
    const baseUrl = request.nextUrl.origin;

    const [submissionsRes, statsRes, warehouseRes] = await Promise.all([
      fetch(`${baseUrl}/api/admin/material-verification/submissions`),
      fetch(`${baseUrl}/api/admin/material-verification/stats`),
      fetch(`${baseUrl}/api/admin/material-verification/warehouse-stats`),
    ]);

    const warmupTime = performance.now() - startTime;

    const results = {
      submissions: submissionsRes.ok,
      stats: statsRes.ok,
      warehouse: warehouseRes.ok,
    };

    const allSuccess = Object.values(results).every((v) => v === true);

    if (allSuccess) {
      console.log(`✅ Cache warmup completed in ${warmupTime.toFixed(0)}ms`);
      return NextResponse.json({
        success: true,
        message: "All caches warmed up successfully",
        duration: `${warmupTime.toFixed(0)}ms`,
        results,
      });
    } else {
      console.log(
        `⚠️ Cache warmup partially completed in ${warmupTime.toFixed(0)}ms`
      );
      return NextResponse.json({
        success: false,
        message: "Some caches failed to warm up",
        duration: `${warmupTime.toFixed(0)}ms`,
        results,
      });
    }
  } catch (error) {
    console.error("Error warming up caches:", error);
    return NextResponse.json(
      { error: "Failed to warm up caches" },
      { status: 500 }
    );
  }
}
