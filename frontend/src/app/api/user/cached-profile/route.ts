import { NextRequest, NextResponse } from "next/server";
import { cache } from "@/lib/redis";

/**
 * GET /api/user/cached-profile
 * Get user profile with Redis caching
 * Cache TTL: 5 minutes (300 seconds)
 */
export async function GET(request: NextRequest) {
  try {
    // Get user ID from session/cookie
    const userDataCookie = request.cookies.get("user_data")?.value;

    if (!userDataCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userData = JSON.parse(userDataCookie);
    const userId = userData.id || userData.asgardeoId;

    if (!userId) {
      return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
    }

    // Redis cache key
    const cacheKey = `user:profile:${userId}`;

    // Try to get from cache first
    const cachedProfile = await cache.get(cacheKey);

    if (cachedProfile) {
      console.log(`✅ Cache HIT for user profile: ${userId}`);
      return NextResponse.json({
        data: cachedProfile,
        cached: true,
        source: "redis",
      });
    }

    console.log(`⚠️ Cache MISS for user profile: ${userId}`);

    // If not in cache, fetch from backend or construct from cookie
    const userProfile = {
      id: userData.id,
      email: userData.email,
      name:
        userData.name || userData.given_name || userData.email?.split("@")[0],
      given_name: userData.given_name,
      family_name: userData.family_name,
      role: userData.role,
      status: userData.status,
      avatar: userData.avatar,
    };

    // Store in cache for 5 minutes (300 seconds)
    await cache.set(cacheKey, userProfile, 300);

    return NextResponse.json({
      data: userProfile,
      cached: false,
      source: "fresh",
    });
  } catch (error) {
    console.error("Error fetching cached user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/cached-profile
 * Clear user profile cache
 */
export async function DELETE(request: NextRequest) {
  try {
    const userDataCookie = request.cookies.get("user_data")?.value;

    if (!userDataCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userData = JSON.parse(userDataCookie);
    const userId = userData.id || userData.asgardeoId;

    if (userId) {
      const cacheKey = `user:profile:${userId}`;
      await cache.del(cacheKey);
      console.log(`🗑️ Cleared cache for user: ${userId}`);
    }

    return NextResponse.json({
      success: true,
      message: "Cache cleared",
    });
  } catch (error) {
    console.error("Error clearing user profile cache:", error);
    return NextResponse.json(
      { error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}
