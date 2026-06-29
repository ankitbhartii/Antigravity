import { Redis } from "@upstash/redis";

// Graceful cache client that checks if Upstash Redis variables are available
let redisClient: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log("Upstash Redis client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Upstash Redis:", err);
  }
} else {
  console.warn("UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN missing. Caching is disabled.");
}

export const getCachedTweet = async (tweetId: string): Promise<any | null> => {
  if (!redisClient) return null;
  try {
    const cached = await redisClient.get(`tweet:${tweetId}`);
    return cached ? cached : null;
  } catch (err) {
    console.error("Redis get failed:", err);
    return null;
  }
};

export const setCachedTweet = async (tweetId: string, tweetData: any): Promise<void> => {
  if (!redisClient) return;
  try {
    // Cache for 6 hours (21600 seconds)
    await redisClient.set(`tweet:${tweetId}`, JSON.stringify(tweetData), { ex: 21600 });
  } catch (err) {
    console.error("Redis set failed:", err);
  }
};
