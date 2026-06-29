const BEARER_TOKEN = "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHJHLTvJu4FA33AGWWjCpTnA";

export async function fetchWithGuestToken(tweetId: string): Promise<any | null> {
  try {
    // 1. Activate Guest Token
    const activateResponse = await fetch("https://api.twitter.com/1.1/guest/activate.json", {
      method: "POST",
      headers: {
        "Authorization": BEARER_TOKEN,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(3000),
    });

    if (!activateResponse.ok) return null;
    const { guest_token } = await activateResponse.json();

    if (!guest_token) return null;

    // 2. Query Twitter GraphQL API for Tweet Details
    // Variable parameters for graphql query
    const variables = {
      tweetId: tweetId,
      withCommunity: false,
      includePromotedContent: false,
      withVoice: false,
    };
    
    const features = {
      creator_subscriptions_tweet_preview_api_enabled: true,
      tweet_awards_web_tipping_enabled: false,
      show_cellpayer_sig: false,
      c9s_tweet_anatomy_moderation_templates_enabled: true,
      responsive_web_graphql_timeline_navigation_enabled: true,
      responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
      responsive_web_graphql_exclude_directive_enabled: true,
      verified_phone_label_enabled: false,
      freedom_of_speech_not_reach_fetch_enabled: true,
      standardized_nudges_misinfo: true,
      tweet_with_visibility_results_prefer_gpg_check: true,
      responsive_web_edit_tweet_api_enabled: true,
      graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
      view_counts_everywhere_api_enabled: true,
      longform_notetweets_consumption_enabled: true,
      responsive_web_twitter_article_tweet_consumption_enabled: false,
      tweet_results_html_level_only_templates_enabled: false,
      responsive_web_home_pinned_timelines_enabled: true,
      android_graphql_skip_api_media_color_palette_enabled: false,
      utg_status_sticker_badge_enabled: false,
      verified_phone_label_at_badge_enabled: false,
    };

    const graphqlUrl = `https://api.twitter.com/graphql/OtPH59jC1jB44GkpxF3Ttw/TweetResultByRestId?variables=${encodeURIComponent(
      JSON.stringify(variables)
    )}&features=${encodeURIComponent(JSON.stringify(features))}`;

    const graphqlResponse = await fetch(graphqlUrl, {
      method: "GET",
      headers: {
        "Authorization": BEARER_TOKEN,
        "x-guest-token": guest_token,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!graphqlResponse.ok) return null;

    const resJson = await graphqlResponse.json();
    const tweetResult = resJson?.data?.tweetResult?.result;
    
    if (!tweetResult) return null;

    const legacy = tweetResult.legacy;
    const userResult = tweetResult.core?.user_results?.result;
    const userLegacy = userResult?.legacy;

    if (legacy && userLegacy) {
      const dateObj = new Date(legacy.created_at);
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

      return {
        name: userLegacy.name,
        username: userLegacy.screen_name,
        avatar: userLegacy.profile_image_url_https?.replace("_normal", ""),
        verified: !!userLegacy.verified,
        text: legacy.full_text || "",
        date: formattedDate,
        likes: formatNumber(legacy.favorite_count),
        retweets: formatNumber(legacy.retweet_count),
        replies: formatNumber(legacy.reply_count),
        quotes: formatNumber(legacy.quote_count || 0),
        views: formatNumber(tweetResult.views?.count ? parseInt(tweetResult.views.count) : 0),
        source: legacy.source ? legacy.source.replace(/<[^>]*>/g, "") : "Twitter Web App",
      };
    }
  } catch (err) {
    console.error("Guest token query failed:", err);
  }

  return null;
}
