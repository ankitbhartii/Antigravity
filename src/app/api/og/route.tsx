import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { THEMES, ThemeKey, LayoutKey } from "@/store/useAppStore";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parse tweet parameters
    const name = searchParams.get("name") || "Antigravity";
    const username = searchParams.get("username") || "antigravity_app";
    const avatar = searchParams.get("avatar") || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&h=150&fit=crop";
    const text = searchParams.get("text") || "Hello world from Satori Edge Rendering!";
    const date = searchParams.get("date") || "10:14 PM · Jun 29, 2026";
    const source = searchParams.get("source") || "Antigravity Web Client";
    const likes = searchParams.get("likes") || "1,248";
    const retweets = searchParams.get("retweets") || "342";
    const replies = searchParams.get("replies") || "89";
    const verified = searchParams.get("verified") === "true";
    const verifiedType = searchParams.get("verifiedType") || "blue";

    // Style parameters
    const layout = (searchParams.get("layout") || "standard") as LayoutKey;
    const themeKey = (searchParams.get("theme") || "dark") as ThemeKey;
    const padding = parseInt(searchParams.get("padding") || "48");
    const rounded = parseInt(searchParams.get("rounded") || "16");
    const shadow = searchParams.get("shadow") !== "false";
    const filled = searchParams.get("filled") !== "false";
    const showWatermark = searchParams.get("showWatermark") !== "false";
    const showMetrics = searchParams.get("showMetrics") !== "false";
    const showAvatars = searchParams.get("showAvatars") !== "false";

    const activeTheme = THEMES[themeKey] || THEMES.dark;

    // Load fonts
    const fontData = await fetch(
      new URL("https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2BgA.woff", import.meta.url)
    ).then((res) => res.arrayBuffer());

    // Resolve verified badge color
    let badgeColor = "#1d9bf0";
    if (verifiedType === "gold") badgeColor = "#e7b909";
    if (verifiedType === "gray") badgeColor = "#829aab";

    // Determine canvas dimensions
    const isSquare = searchParams.get("size") === "ig_post";
    const isStory = searchParams.get("size") === "ig_story";
    const width = isSquare ? 1080 : isStory ? 1080 : 800;
    const height = isSquare ? 1080 : isStory ? 1920 : 500;

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: filled ? activeTheme.background : "transparent",
            padding: `${padding * 2}px`, // Multiply padding for 1080px density
            boxSizing: "border-box",
          }}
        >
          {/* Card Container */}
          <div
            style={{
              backgroundColor: activeTheme.cardBg,
              border: `1.5px solid ${activeTheme.cardBorder}`,
              borderRadius: `${rounded * 1.5}px`,
              width: "100%",
              maxWidth: "600px",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              boxShadow: shadow ? "0 25px 50px -12px rgba(0, 0, 0, 0.4)" : "none",
              position: "relative",
            }}
          >
            {/* Classic layout */}
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {showAvatars && (
                    <img
                      src={avatar}
                      alt={name}
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginRight: "16px",
                      }}
                    />
                  )}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", fontWeight: "bold", fontSize: "20px", color: activeTheme.cardText }}>
                      <span>{name}</span>
                      {verified && (
                        <svg
                          viewBox="0 0 24 24"
                          style={{ width: "20px", height: "20px", fill: badgeColor, marginLeft: "4px" }}
                        >
                          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.938.1-1.354.27C14.773 2.518 13.5 1.7 12 1.7c-1.5 0-2.773.817-3.418 2.08-.416-.17-.874-.27-1.354-.27-2.108 0-3.818 1.78-3.818 3.99 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .938-.1 1.354-.27.645 1.263 1.918 2.08 3.418 2.08 1.5 0 2.773-.817 3.418-2.08.416.17.874.27 1.354.27 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.72 3.23l-3.32-3.32L7.87 11l1.91 1.91 4.35-4.35 1.41 1.41-5.76 5.76z" />
                        </svg>
                      )}
                    </div>
                    <div style={{ display: "flex", fontSize: "16px", color: activeTheme.cardText, opacity: 0.6 }}>
                      @{username}
                    </div>
                  </div>
                </div>
                {/* Logo */}
                <div style={{ display: "flex", opacity: 0.3 }}>
                  <svg viewBox="0 0 24 24" style={{ width: "26px", height: "26px", fill: activeTheme.cardText }}>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
              </div>

              {/* Text */}
              <div
                style={{
                  fontSize: "22px",
                  lineHeight: "1.5",
                  color: activeTheme.cardText,
                  marginBottom: "24px",
                  display: "flex",
                  whiteSpace: "pre-wrap",
                }}
              >
                {text}
              </div>

              {/* Date */}
              <div
                style={{
                  display: "flex",
                  fontSize: "15px",
                  color: activeTheme.cardText,
                  opacity: 0.5,
                  paddingBottom: "16px",
                  borderBottom: `1.5px solid ${activeTheme.cardBorder}`,
                  width: "100%",
                }}
              >
                <span>{date}</span>
                <span style={{ margin: "0 8px" }}>·</span>
                <span style={{ color: activeTheme.accent, fontWeight: "bold" }}>{source}</span>
              </div>

              {/* Metrics */}
              {showMetrics && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "16px 0",
                    borderBottom: `1.5px solid ${activeTheme.cardBorder}`,
                    fontSize: "15px",
                    color: activeTheme.cardText,
                    width: "100%",
                  }}
                >
                  <div style={{ marginRight: "24px", display: "flex" }}>
                    <span style={{ fontWeight: "bold", marginRight: "4px" }}>{likes}</span>
                    <span style={{ opacity: 0.6 }}>Likes</span>
                  </div>
                  <div style={{ marginRight: "24px", display: "flex" }}>
                    <span style={{ fontWeight: "bold", marginRight: "4px" }}>{retweets}</span>
                    <span style={{ opacity: 0.6 }}>Reposts</span>
                  </div>
                  <div style={{ display: "flex" }}>
                    <span style={{ fontWeight: "bold", marginRight: "4px" }}>{replies}</span>
                    <span style={{ opacity: 0.6 }}>Replies</span>
                  </div>
                </div>
              )}
            </div>

            {/* Watermark brand */}
            {showWatermark && (
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  right: "16px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  color: activeTheme.accent,
                  opacity: 0.4,
                  display: "flex",
                  letterSpacing: "1px",
                }}
              >
                Antigravity App
              </div>
            )}
          </div>
        </div>
      ),
      {
        width,
        height,
        fonts: [
          {
            name: "Inter",
            data: fontData,
            style: "normal",
          },
        ],
      }
    );
  } catch (err: any) {
    return new Response(`Failed to generate image: ${err.message}`, { status: 500 });
  }
}
