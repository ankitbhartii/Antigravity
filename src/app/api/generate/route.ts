import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TweetFetcher } from "@/lib/router";
import { getUpscaledAvatar } from "@/lib/upscaler";

export const runtime = "edge";

const GenerateRequestSchema = z.object({
  url: z.string().url("Please provide a valid URL"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = GenerateRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { url } = result.data;
    
    // Extract Tweet ID using regex
    // e.g. https://x.com/jack/status/20 -> Rest ID: 20
    const match = url.match(/status\/(\d+)/);
    if (!match || !match[1]) {
      return NextResponse.json(
        { error: "Could not parse Tweet ID from the URL. Please verify the link format." },
        { status: 400 }
      );
    }

    const tweetId = match[1];

    // 1. Fetch tweet details using our Circuit-Breaker router
    let tweet = await TweetFetcher.fetch(tweetId);

    if (!tweet) {
      // Return a graceful simulated fallback tweet if Twitter APIs block it.
      // This ensures a functional frontend demo experience.
      console.warn(`Fallback: Generating high-fidelity mock data for Tweet ${tweetId}`);
      
      const usernameMatch = url.match(/x\.com\/([^\/]+)/) || url.match(/twitter\.com\/([^\/]+)/);
      const handle = usernameMatch ? usernameMatch[1] : "user";
      
      tweet = {
        name: handle.charAt(0).toUpperCase() + handle.slice(1),
        username: handle,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
        verified: true,
        text: "Twitter APIs are currently offline, but Antigravity let you edit everything! Double-click this text or avatar to customize this mockup. 🌌🚀",
        date: new Date().toLocaleDateString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          month: "short",
          day: "numeric",
          year: "numeric",
        }).replace(",", " ·"),
        likes: "15.4K",
        retweets: "2.3K",
        replies: "482",
        quotes: "109",
        views: "1.2M",
        source: "Antigravity Fallback",
      };
    }

    // 2. Upscale avatar image asynchronously/synchronously
    try {
      const upscaledAvatar = await getUpscaledAvatar(tweet.avatar);
      tweet.avatar = upscaledAvatar;
    } catch (e) {
      console.warn("Avatar upscaling failed:", e);
    }

    return NextResponse.json({ success: true, tweet });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
