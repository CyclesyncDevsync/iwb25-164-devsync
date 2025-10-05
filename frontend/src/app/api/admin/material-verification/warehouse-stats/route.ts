import { NextRequest, NextResponse } from "next/server";
import { cache } from "@/lib/redis";

/**
 * GET /api/admin/material-verification/warehouse-stats
 * Get warehouse drop-off statistics with Redis caching
 * Cache TTL: 2 minutes (120 seconds) - Increased for faster perceived performance
 */
export async function GET(request: NextRequest) {
  try {
    const cacheKey = "admin:warehouse-stats";

    // Try to get from cache first
    const cachedStats = await cache.get(cacheKey);

    if (cachedStats) {
      console.log("✅ Cache HIT for warehouse stats - INSTANT LOAD");
      return NextResponse.json({
        data: cachedStats,
        cached: true,
        source: "redis",
        timestamp: new Date().toISOString(),
      });
    }

    console.log("⚠️ Cache MISS for warehouse stats - Calculating...");

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

    // Calculate warehouse statistics
    const dropOffSubmissions = submissions.filter(
      (s: any) => s.delivery_method === "drop_off"
    );

    const warehouseStats: { [key: string]: number } = {};

    dropOffSubmissions.forEach((sub: any) => {
      const warehouseName = sub.selected_warehouse_name || "Unknown";
      warehouseStats[warehouseName] = (warehouseStats[warehouseName] || 0) + 1;
    });

    // Mock warehouse centers with actual drop-off counts
    const warehouses = [
      {
        id: "wh-1",
        name: "Colombo Collection Center",
        address: "Colombo District Center",
        latitude: 6.9271,
        longitude: 79.8612,
        dropOffRequests: warehouseStats["Colombo Collection Center"] || 0,
      },
      {
        id: "wh-2",
        name: "Kandy Collection Center",
        address: "Kandy Distribution Center",
        latitude: 7.2906,
        longitude: 80.6337,
        dropOffRequests: warehouseStats["Kandy Collection Center"] || 0,
      },
      {
        id: "wh-3",
        name: "Galle Collection Center",
        address: "Galle Collection Point",
        latitude: 6.0535,
        longitude: 80.221,
        dropOffRequests: warehouseStats["Galle Collection Center"] || 0,
      },
    ];

    // Store in cache for 2 minutes (120 seconds) - Increased for faster perceived performance
    await cache.set(cacheKey, warehouses, 120);

    return NextResponse.json({
      data: warehouses,
      cached: false,
      source: "fresh",
    });
  } catch (error) {
    console.error("Error fetching warehouse stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouse statistics" },
      { status: 500 }
    );
  }
}
