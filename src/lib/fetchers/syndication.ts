import { NitterTweet } from "./nitter";

function getToken(id: string): string {
  return ((Number(id) / 1e15) * Math.PI)
    .toString(36)
    .replace(/(0+|\.)/g, "");
}

export async function fetchFromSyndication(tweetId: string): Promise<any | null> {
  try {
    const token = getToken(tweetId);
    const url = `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=${token}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
      },
      signal: AbortSignal.timeout(4000), // 4 seconds timeout
    });

    if (!response.ok) {
      console.warn(`Syndication fetch returned status: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data && data.user) {
      // Construct date string
      const dateObj = new Date(data.created_at || Date.now());
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        month: "short",
        day: "numeric",
        year: "numeric",
      }).replace(",", " ·");

      const formatNumber = (num: number) => {
        if (!num) return "0";
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
        if (num >= 1000) return (num / 1000).toFixed(1) + "K";
        return num.toLocaleString();
      };

      // Clean tweet text (remove media links at the end of the text if present)
      let tweetText = data.text || "";
      if (data.entities?.media) {
        data.entities.media.forEach((m: any) => {
          tweetText = tweetText.replace(m.url, "");
        });
      }
      tweetText = tweetText.trim();

      // Extract photos
      const images = data.photos
        ? data.photos.map((p: any) => p.url)
        : [];

      return {
        name: data.user.name,
        username: data.user.screen_name,
        avatar: data.user.profile_image_url_https?.replace("_normal", ""),
        verified: !!data.user.is_blue_verified || !!data.user.verified,
        text: tweetText,
        date: formattedDate,
        likes: formatNumber(data.favorite_count || 0),
        retweets: formatNumber(data.retweet_count || 0),
        replies: formatNumber(data.conversation_count || 0),
        quotes: formatNumber(data.quote_count || 0),
        views: formatNumber(data.view_count || 0),
        source: "X for Web",
        images: images,
      };
    }
  } catch (err) {
    console.error("Syndication API fetch failed:", err);
  }

  return null;
}
