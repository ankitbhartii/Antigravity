import { fetchFromNitter, NitterTweet } from "./fetchers/nitter";
import { fetchWithGuestToken } from "./fetchers/guest-token";
import { fetchFromSyndication } from "./fetchers/syndication";
import { getCachedTweet, setCachedTweet } from "./cache";

interface CircuitBreakerState {
  failures: number;
  deadUntil: number;
}

// Circuit breaker tracking map for fetchers
const breakerState: Record<string, CircuitBreakerState> = {
  syndication: { failures: 0, deadUntil: 0 },
  nitter: { failures: 0, deadUntil: 0 },
  guestToken: { failures: 0, deadUntil: 0 },
};

const FAILURE_THRESHOLD = 3;
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

function isSourceAvailable(sourceKey: string): boolean {
  const state = breakerState[sourceKey];
  if (!state) return true;
  if (state.deadUntil && Date.now() < state.deadUntil) {
    return false; // Source is currently dead
  }
  return true;
}

function recordSuccess(sourceKey: string) {
  const state = breakerState[sourceKey];
  if (state) {
    state.failures = 0;
    state.deadUntil = 0;
  }
}

function recordFailure(sourceKey: string) {
  const state = breakerState[sourceKey];
  if (state) {
    state.failures += 1;
    if (state.failures >= FAILURE_THRESHOLD) {
      state.deadUntil = Date.now() + COOLDOWN_MS;
      console.warn(`Circuit Breaker: Source "${sourceKey}" tripped. Marked dead for 5 minutes.`);
    }
  }
}

export class TweetFetcher {
  static async fetch(tweetId: string): Promise<NitterTweet | null> {
    // 1. Check Upstash Redis Cache first
    try {
      const cached = await getCachedTweet(tweetId);
      if (cached) {
        console.log(`Cache Hit: Served tweet ${tweetId} from Upstash Redis.`);
        return typeof cached === "string" ? JSON.parse(cached) : cached;
      }
    } catch (e) {
      console.warn("Failed reading from Redis cache:", e);
    }

    // 2. Try Twitter Syndication API (Fastest and most direct CDN route)
    if (isSourceAvailable("syndication")) {
      console.log(`Attempting fetch for tweet ${tweetId} via Syndication API...`);
      const syndicationData = await fetchFromSyndication(tweetId);
      if (syndicationData) {
        recordSuccess("syndication");
        // Save to cache asynchronously
        setCachedTweet(tweetId, syndicationData).catch(console.error);
        return syndicationData;
      } else {
        recordFailure("syndication");
      }
    } else {
      console.log("Syndication API is currently cool-tripped. Skipping to Nitter.");
    }

    // 3. Try Nitter Instance Pool (Fallback I)
    if (isSourceAvailable("nitter")) {
      console.log(`Attempting fetch for tweet ${tweetId} via Nitter Pool...`);
      const nitterData = await fetchFromNitter(tweetId);
      if (nitterData) {
        recordSuccess("nitter");
        // Save to cache
        setCachedTweet(tweetId, nitterData).catch(console.error);
        return nitterData;
      } else {
        recordFailure("nitter");
      }
    } else {
      console.log("Nitter pool is currently cool-tripped. Skipping to Guest Token.");
    }

    // 4. Try Guest Token GraphQL API (Fallback II)
    if (isSourceAvailable("guestToken")) {
      console.log(`Attempting fetch for tweet ${tweetId} via Guest Token API...`);
      const tokenData = await fetchWithGuestToken(tweetId);
      if (tokenData) {
        recordSuccess("guestToken");
        // Save to cache
        setCachedTweet(tweetId, tokenData).catch(console.error);
        return tokenData;
      } else {
        recordFailure("guestToken");
      }
    } else {
      console.log("Guest Token API is currently cool-tripped. Skipping.");
    }

    // 5. Return null if all production fetch routes fail
    console.error(`All tweet fetching sources failed for tweet ID ${tweetId}`);
    return null;
  }
}
export type { NitterTweet as TweetDataResponse };
