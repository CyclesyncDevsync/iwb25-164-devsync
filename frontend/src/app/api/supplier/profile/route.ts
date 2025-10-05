import { NextRequest, NextResponse } from "next/server";
import { cache } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    // Get user from auth context
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract supplier ID from token or session
    // For now, we'll use a query parameter
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplierId");

    if (!supplierId) {
      return NextResponse.json(
        { error: "Supplier ID required" },
        { status: 400 }
      );
    }

    // Cache key for this supplier's profile
    const cacheKey = `supplier:profile:${supplierId}`;

    // Try to get from cache using getOrSet pattern
    const profile = await cache.getOrSet(
      cacheKey,
      async () => {
        // Fetch from backend if not in cache
        const response = await fetch(
          `http://localhost:8080/api/supplier/${supplierId}`,
          {
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch supplier profile");
        }

        return await response.json();
      },
      300 // Cache for 5 minutes
    );

    return NextResponse.json({
      status: "success",
      data: profile,
      cached: true,
    });
  } catch (error: any) {
    console.error("Error fetching supplier profile:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
