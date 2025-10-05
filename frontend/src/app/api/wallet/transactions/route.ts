import { NextRequest, NextResponse } from "next/server";
import { cache } from "@/lib/redis";

const WALLET_API_URL =
  process.env.NEXT_PUBLIC_WALLET_API_URL || "http://localhost:8097";
const CACHE_TTL = 30; // 30 seconds cache (shorter for transactions since they update more frequently)

export async function GET(request: NextRequest) {
  try {
    // Get ID token from HTTP-only cookie
    const idToken = request.cookies.get("asgardeo_id_token")?.value;

    if (!idToken) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Please login to access wallet features",
        },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";

    // Create cache key based on user token and query params
    const userHash = Buffer.from(idToken).toString("base64").slice(0, 32);
    const cacheKey = `wallet:transactions:${userHash}:page${page}:limit${limit}`;

    // Try to get from cache
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      console.log("✅ Cache HIT - Wallet transactions");
      return NextResponse.json({
        ...cachedData,
        cached: true,
        cacheTime: new Date().toISOString(),
      });
    }

    console.log("❌ Cache MISS - Fetching wallet transactions from backend");

    // Forward request to Ballerina wallet service with auth token
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const backendResponse = await fetch(
      `${WALLET_API_URL}/api/wallet/transactions?page=${page}&limit=${limit}`,
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
      console.log(`✅ Cached wallet transactions for ${CACHE_TTL}s`);
    }

    return NextResponse.json(backendData, { status: backendResponse.status });
  } catch (error) {
    console.error("Wallet transactions error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to fetch wallet transactions",
      },
      { status: 500 }
    );
  }
}
