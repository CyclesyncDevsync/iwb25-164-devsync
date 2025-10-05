import { NextRequest, NextResponse } from "next/server";
import { cache } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    // Get auth data
    const authResponse = await fetch("http://localhost:3000/api/auth/me", {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    if (!authResponse.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authData = await authResponse.json();
    const idToken = authData.idToken;
    const supplierId =
      authData.user?.asgardeoId || authData.user?.sub || authData.userId;

    if (!supplierId) {
      return NextResponse.json(
        { error: "Supplier ID not found" },
        { status: 400 }
      );
    }

    // Cache key for unread messages
    const cacheKey = `supplier:unread:${supplierId}`;

    // Use shorter TTL (30 seconds) for real-time data like unread counts
    const unreadData = await cache.getOrSet(
      cacheKey,
      async () => {
        const response = await fetch(
          `http://localhost:8087/api/chat/rooms/supplier/${supplierId}/unread-count`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch unread count");
        }

        return await response.json();
      },
      30 // Cache for only 30 seconds for fresher data
    );

    return NextResponse.json({
      status: "success",
      data: unreadData,
      cached: true,
    });
  } catch (error: any) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
