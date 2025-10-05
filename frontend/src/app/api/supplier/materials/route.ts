import { NextRequest, NextResponse } from "next/server";
import { cache } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get("supplierId");

    if (!supplierId) {
      return NextResponse.json(
        { error: "Supplier ID required" },
        { status: 400 }
      );
    }

    // Cache key for materials list
    const cacheKey = `supplier:materials:${supplierId}`;

    // Cache materials for 2 minutes
    const materials = await cache.getOrSet(
      cacheKey,
      async () => {
        const response = await fetch(
          `http://localhost:8086/api/material/workflow/submissions/${supplierId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch materials");
        }

        return await response.json();
      },
      120 // Cache for 2 minutes
    );

    return NextResponse.json({
      status: "success",
      data: materials,
      cached: true,
    });
  } catch (error: any) {
    console.error("Error fetching materials:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST endpoint to invalidate cache when new material is added
export async function POST(request: NextRequest) {
  try {
    const { supplierId } = await request.json();

    if (!supplierId) {
      return NextResponse.json(
        { error: "Supplier ID required" },
        { status: 400 }
      );
    }

    // Invalidate the materials cache
    const cacheKey = `supplier:materials:${supplierId}`;
    await cache.del(cacheKey);

    return NextResponse.json({
      status: "success",
      message: "Cache invalidated",
    });
  } catch (error: any) {
    console.error("Error invalidating cache:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
