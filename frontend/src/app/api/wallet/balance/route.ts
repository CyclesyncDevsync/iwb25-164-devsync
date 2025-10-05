import { NextRequest, NextResponse } from "next/server";
import { cache } from "@/lib/redis";

const WALLET_API_URL =
  process.env.NEXT_PUBLIC_WALLET_API_URL || "http://localhost:8097";
const CACHE_TTL = 60; // 60 seconds cache

export async function GET(request: NextRequest) {
  try {
    // Debug: Log cookies for wallet API
    console.log("=== WALLET API DEBUG ===");
    console.log(
      "Wallet cookies:",
      request.cookies
        .getAll()
        .map((c) => ({ name: c.name, hasValue: !!c.value }))
    );

    // Get ID token from HTTP-only cookie
    const idToken = request.cookies.get("asgardeo_id_token")?.value;
    console.log("Wallet ID Token found:", idToken ? "Yes" : "No");

    if (!idToken) {
      console.log("Wallet: No asgardeo_id_token cookie found");
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Please login to access wallet features",
        },
        { status: 401 }
      );
    }

    // Create cache key based on user token (use a hash for security)
    const userHash = Buffer.from(idToken).toString("base64").slice(0, 32);
    const cacheKey = `wallet:balance:${userHash}`;

    // Try to get from cache
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      console.log("✅ Cache HIT - Wallet balance");
      return NextResponse.json({
        ...cachedData,
        cached: true,
        cacheTime: new Date().toISOString(),
      });
    }

    console.log("❌ Cache MISS - Fetching wallet balance from backend");

    // Forward request to Ballerina wallet service with auth token
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const backendResponse = await fetch(
      `${WALLET_API_URL}/api/wallet/balance`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    const backendData = await backendResponse.json();

    // Cache successful responses
    if (backendResponse.ok && backendData.status === "success") {
      await cache.set(cacheKey, backendData, CACHE_TTL);
      console.log(`✅ Cached wallet balance for ${CACHE_TTL}s`);
    }

    return NextResponse.json(backendData, { status: backendResponse.status });
  } catch (error) {
    console.error("Wallet balance error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to fetch wallet balance",
      },
      { status: 500 }
    );
  }
}
