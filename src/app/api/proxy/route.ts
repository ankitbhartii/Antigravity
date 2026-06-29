import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// Whitelist regex for Twitter/X CDN domains
const TWITTER_CDN_REGEX = /^https:\/\/(pbs|video|abs)\.twimg\.com\//;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // 1. SSRF check: Strict domain validation
  if (!TWITTER_CDN_REGEX.test(targetUrl)) {
    // If it's a fallback unsplash image from our default templates, allow it for demo convenience
    const isUnsplash = targetUrl.startsWith("https://images.unsplash.com/");
    if (!isUnsplash) {
      return new NextResponse("Forbidden target domain (SSRF Gate)", { status: 403 });
    }
  }

  // Prevent local/internal IP hosts explicitly
  try {
    const parsedUrl = new URL(targetUrl);
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Reject loopbacks, link-locals, and private IPs
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.") ||
      hostname === "169.254.169.254"
    ) {
      return new NextResponse("Forbidden internal address", { status: 403 });
    }
  } catch (e) {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  // 2. Fetch the target image with CORS bypass
  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow", // Satori requires following redirects
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return new NextResponse(`Proxy fetch failed: ${response.statusText}`, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    // 3. Return image with aggressive CDN cache control headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      },
    });
  } catch (err: any) {
    return new NextResponse(`Proxy error: ${err.message}`, { status: 500 });
  }
}
