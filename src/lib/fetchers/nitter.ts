// Pool of public Nitter nodes for scraping
const NITTER_INSTANCES = [
  "nitter.privacydev.net",
  "nitter.cz",
  "nitter.net",
  "nitter.it",
  "nitter.tokhmi.xyz",
  "nitter.no-logs.com",
];

export interface NitterTweet {
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  text: string;
  date: string;
  likes: string;
  retweets: string;
  replies: string;
  quotes: string;
  views: string;
  source: string;
}

export async function fetchFromNitter(tweetId: string): Promise<NitterTweet | null> {
  // Shuffle Nitter nodes to distribute load
  const shuffledNodes = [...NITTER_INSTANCES].sort(() => Math.random() - 0.5);

  for (const node of shuffledNodes) {
    try {
      const url = `https://${node}/i/api/post/${tweetId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(4000), // 4 seconds timeout per instance
      });

      if (!response.ok) continue;

      const data = await response.json();
      
      // Parse Nitter API response format
      if (data && data.user) {
        // Construct clean date
        const dateObj = new Date(data.created_at || Date.now());
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          month: "short",
          day: "numeric",
          year: "numeric",
        }).replace(",", " ·");

        // Format metrics
        const formatNumber = (num: number) => {
          if (!num) return "0";
          if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
          if (num >= 1000) return (num / 1000).toFixed(1) + "K";
          return num.toLocaleString();
        };

        return {
          name: data.user.name,
          username: data.user.screen_name,
          avatar: data.user.profile_image_url_https?.replace("_normal", ""),
          verified: !!data.user.verified,
          text: data.text || "",
          date: formattedDate,
          likes: formatNumber(data.favorite_count),
          retweets: formatNumber(data.retweet_count),
          replies: formatNumber(data.reply_count),
          quotes: formatNumber(data.quote_count || 0),
          views: formatNumber(data.view_count || 0),
          source: data.source ? data.source.replace(/<[^>]*>/g, "") : "Twitter Web App",
        };
      }
    } catch (err) {
      console.warn(`Failed fetching from Nitter node ${node}:`, err);
    }
  }

  return null;
}
