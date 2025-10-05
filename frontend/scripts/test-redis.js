/**
 * Redis Connection Test Script
 * Run: node scripts/test-redis.js
 */

const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
});

async function testRedisConnection() {
  console.log("🔍 Testing Redis connection...\n");

  try {
    // Test 1: Ping
    console.log("Test 1: Ping");
    const pingResult = await redis.ping();
    console.log(`✅ Ping result: ${pingResult}\n`);

    // Test 2: Set and Get
    console.log("Test 2: Set and Get");
    await redis.set("test:key", "Hello Redis!", "EX", 10);
    const value = await redis.get("test:key");
    console.log(`✅ Set/Get: ${value}\n`);

    // Test 3: Check TTL
    console.log("Test 3: Check TTL");
    const ttl = await redis.ttl("test:key");
    console.log(`✅ TTL: ${ttl} seconds\n`);

    // Test 4: User cache simulation
    console.log("Test 4: User Cache Simulation");
    const userCache = {
      id: "test-user-123",
      name: "Test Admin",
      email: "admin@cyclesync.com",
      role: "ADMIN",
    };
    await redis.set(
      "user:profile:test-user-123",
      JSON.stringify(userCache),
      "EX",
      300
    );
    const cachedUser = await redis.get("user:profile:test-user-123");
    console.log(`✅ User cache: ${cachedUser}\n`);

    // Test 5: Check all keys
    console.log("Test 5: List all keys");
    const keys = await redis.keys("*");
    console.log(`✅ Found ${keys.length} keys:`, keys, "\n");

    // Test 6: Delete test keys
    console.log("Test 6: Cleanup");
    await redis.del("test:key");
    await redis.del("user:profile:test-user-123");
    console.log("✅ Test keys deleted\n");

    console.log("🎉 All tests passed! Redis is working correctly.\n");
    console.log("Redis Configuration:");
    console.log(`  Host: ${redis.options.host}`);
    console.log(`  Port: ${redis.options.port}`);
    console.log(`  Database: ${redis.options.db || 0}`);
  } catch (error) {
    console.error("❌ Redis test failed:", error.message);
    console.error("\nTroubleshooting:");
    console.error("  1. Make sure Redis is running: redis-server");
    console.error("  2. Check REDIS_HOST and REDIS_PORT in .env");
    console.error("  3. Verify Redis is accessible: redis-cli ping");
  } finally {
    await redis.quit();
    console.log("\n👋 Connection closed");
  }
}

testRedisConnection();
