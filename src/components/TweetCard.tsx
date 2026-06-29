"use client";

import React, { useRef } from "react";
import { TweetData, StyleOptions, THEMES, LayoutKey } from "@/store/useAppStore";
import { Check } from "lucide-react";

interface TweetCardProps {
  tweetData: TweetData;
  styleOptions: StyleOptions;
  isEditable?: boolean;
  onTweetDataChange?: (key: keyof TweetData, value: string | boolean) => void;
}

export const TweetCard: React.FC<TweetCardProps> = ({
  tweetData,
  styleOptions,
  isEditable = true,
  onTweetDataChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeTheme = THEMES[styleOptions.theme];
  const { layout, rounded, shadow, showWatermark, showMetrics, showAvatars } = styleOptions;

  const handleTextChange = (key: keyof TweetData, text: string) => {
    if (onTweetDataChange) {
      onTweetDataChange(key, text);
    }
  };

  const handleAvatarClick = () => {
    if (isEditable && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && onTweetDataChange) {
          onTweetDataChange("avatar", event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const renderVerifiedBadge = () => {
    if (!tweetData.verified || tweetData.verifiedType === "none") return null;

    let badgeColor = "#1d9bf0"; // Blue
    if (tweetData.verifiedType === "gold") badgeColor = "#e7b909"; // Gold
    if (tweetData.verifiedType === "gray") badgeColor = "#829aab"; // Gray

    return (
      <svg
        viewBox="0 0 24 24"
        className="w-[18px] h-[18px] inline-block ml-1 select-none align-text-bottom"
        style={{ fill: badgeColor }}
      >
        <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.938.1-1.354.27C14.773 2.518 13.5 1.7 12 1.7c-1.5 0-2.773.817-3.418 2.08-.416-.17-.874-.27-1.354-.27-2.108 0-3.818 1.78-3.818 3.99 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .938-.1 1.354-.27.645 1.263 1.918 2.08 3.418 2.08 1.5 0 2.773-.817 3.418-2.08.416.17.874.27 1.354.27 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.72 3.23l-3.32-3.32L7.87 11l1.91 1.91 4.35-4.35 1.41 1.41-5.76 5.76z" />
      </svg>
    );
  };

  // Base styling for the card container
  const cardStyle: React.CSSProperties = {
    backgroundColor: activeTheme.cardBg,
    color: activeTheme.cardText,
    borderRadius: `${rounded}px`,
    borderColor: activeTheme.cardBorder,
    borderWidth: "1px",
    boxShadow: shadow ? "0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)" : "none",
    width: "100%",
    maxWidth: "550px",
    display: "flex",
    flexDirection: "column",
    padding: "24px",
    boxSizing: "border-box",
    textAlign: "left",
    position: "relative",
    overflow: layout === "iconic" ? "visible" : "hidden",
  };

  const editableProps = (key: keyof TweetData, extraClass = "") => ({
    contentEditable: isEditable,
    suppressContentEditableWarning: true,
    onBlur: (e: React.FocusEvent<HTMLSpanElement>) =>
      handleTextChange(key, e.currentTarget.textContent || ""),
    style: { outline: "none" },
    className: `${extraClass} ${
      isEditable ? "hover:bg-slate-500/10 rounded px-1 -mx-1 cursor-text transition-colors" : ""
    }`.trim(),
  });

  const getProxyUrl = (url: string) => {
    if (!url) return "";
    if (
      url.startsWith("data:") ||
      url.startsWith("/") ||
      url.startsWith("blob:") ||
      url.startsWith("http://localhost:") ||
      url.startsWith("https://localhost:")
    ) {
      return url;
    }
    return `/api/proxy?url=${encodeURIComponent(url)}`;
  };

  const renderMedia = () => {
    if (!tweetData.images || tweetData.images.length === 0) return null;

    const count = tweetData.images.length;
    let gridClass = "grid grid-cols-1 gap-2 mt-3 overflow-hidden border border-slate-700/10";
    if (count === 2) gridClass = "grid grid-cols-2 gap-2 mt-3 overflow-hidden border border-slate-700/10";
    if (count >= 3) gridClass = "grid grid-cols-2 gap-2 mt-3 overflow-hidden border border-slate-700/10";

    return (
      <div className={gridClass} style={{ borderRadius: "12px" }}>
        {tweetData.images.map((imgUrl, idx) => {
          let colSpan = "";
          if (count === 3 && idx === 0) colSpan = "row-span-2";
          
          const imgClass = count === 1
            ? "w-full h-auto object-contain max-h-[550px]"
            : `w-full object-cover max-h-[260px] ${colSpan}`;

          return (
            <img
              key={idx}
              src={getProxyUrl(imgUrl)}
              alt="Tweet Media"
              className={imgClass}
              style={{ display: "block" }}
            />
          );
        })}
      </div>
    );
  };

  const renderLinkPreview = () => {
    if (!tweetData.linkPreview) return null;
    const { title, description, image, domain } = tweetData.linkPreview;

    return (
      <div 
        className="flex flex-col mt-3 overflow-hidden border" 
        style={{ 
          borderRadius: "12px", 
          borderColor: activeTheme.cardBorder,
          backgroundColor: activeTheme.isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"
        }}
      >
        {image && (
          <img 
            src={getProxyUrl(image)}
            alt={title}
            className="w-full object-cover max-h-[240px] border-b"
            style={{ borderColor: activeTheme.cardBorder, display: "block" }}
          />
        )}
        <div className="p-3 flex flex-col gap-0.5 text-left">
          <span className="text-[11px] opacity-50 lowercase tracking-tight">
            {domain}
          </span>
          <span className="text-[13px] font-bold line-clamp-1" style={{ color: activeTheme.cardText }}>
            {title}
          </span>
          {description && (
            <span className="text-[11px] opacity-60 line-clamp-2 leading-tight" style={{ color: activeTheme.cardText }}>
              {description}
            </span>
          )}
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // RENDERING LAYOUT VARIANTS
  // -------------------------------------------------------------

  const renderLayoutContent = () => {
    switch (layout) {
      case "bubble1":
        // Chat bubble pointing left
        return (
          <div className="flex flex-col w-full">
            <div className="flex items-end gap-3 mb-2">
              {showAvatars && (
                <div className="relative shrink-0 select-none cursor-pointer" onClick={handleAvatarClick}>
                  <img
                    src={getProxyUrl(tweetData.avatar)}
                    alt={tweetData.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700/20"
                  />
                  {isEditable && (
                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                  )}
                </div>
              )}
              <div
                className="rounded-2xl rounded-bl-none px-4 py-3 max-w-[85%] flex flex-col"
                style={{ backgroundColor: activeTheme.accent, color: "#ffffff" }}
              >
                <div className="flex items-center gap-1 mb-1 text-xs opacity-90 font-semibold">
                  <span {...editableProps("name")}>{tweetData.name}</span>
                  {renderVerifiedBadge()}
                </div>
                <div {...editableProps("text", "text-sm leading-relaxed whitespace-pre-wrap")}>
                  {tweetData.text}
                </div>
                {renderMedia()}
                {renderLinkPreview()}
              </div>
            </div>
            {showMetrics && renderCompactMetrics()}
          </div>
        );

      case "bubble2":
        // Chat bubble pointing right (Self sender)
        return (
          <div className="flex flex-col items-end w-full">
            <div className="flex items-end gap-3 mb-2 justify-end w-full">
              <div
                className="rounded-2xl rounded-br-none px-4 py-3 max-w-[85%] flex flex-col text-right"
                style={{ backgroundColor: "#2797dd", color: "#ffffff" }}
              >
                <div className="flex items-center justify-end gap-1 mb-1 text-xs opacity-90 font-semibold">
                  <span {...editableProps("name")}>{tweetData.name}</span>
                  {renderVerifiedBadge()}
                </div>
                <div {...editableProps("text", "text-sm leading-relaxed whitespace-pre-wrap text-left")}>
                  {tweetData.text}
                </div>
                {renderMedia()}
                {renderLinkPreview()}
              </div>
              {showAvatars && (
                <div className="relative shrink-0 select-none cursor-pointer" onClick={handleAvatarClick}>
                  <img
                    src={getProxyUrl(tweetData.avatar)}
                    alt={tweetData.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700/20"
                  />
                  {isEditable && (
                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                  )}
                </div>
              )}
            </div>
            {showMetrics && renderCompactMetrics()}
          </div>
        );

      case "fab":
        // Minimalist bold display layout
        return (
          <div className="flex flex-col w-full gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {showAvatars && (
                  <div className="relative select-none cursor-pointer" onClick={handleAvatarClick}>
                    <img
                      src={getProxyUrl(tweetData.avatar)}
                      alt={tweetData.name}
                      className="w-14 h-14 rounded-full object-cover border-2"
                      style={{ borderColor: activeTheme.accent }}
                    />
                    {isEditable && (
                      <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                    )}
                  </div>
                )}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 font-extrabold text-lg leading-tight">
                    <span {...editableProps("name")}>{tweetData.name}</span>
                    {renderVerifiedBadge()}
                  </div>
                  <div className="text-sm opacity-60">
                    @<span {...editableProps("username")}>{tweetData.username}</span>
                  </div>
                </div>
              </div>
              <div className="text-xs opacity-50 px-2 py-1 rounded bg-slate-500/10">
                <span {...editableProps("source")}>{tweetData.source}</span>
              </div>
            </div>
            <div
              {...editableProps("text")}
              className="text-xl font-medium leading-relaxed whitespace-pre-wrap border-l-4 pl-4 py-1"
              style={{ borderLeftColor: activeTheme.accent }}
            >
              {tweetData.text}
            </div>
            {renderMedia()}
            {renderLinkPreview()}
            {showMetrics && (
              <div className="flex items-center gap-4 text-xs opacity-60 border-t pt-3" style={{ borderColor: activeTheme.cardBorder }}>
                <div>
                  <strong>{tweetData.likes}</strong> Likes
                </div>
                <div>
                  <strong>{tweetData.retweets}</strong> Reposts
                </div>
              </div>
            )}
          </div>
        );

      case "iconic":
        // Big profile circle offset magazine style
        return (
          <div className="flex flex-col w-full items-center text-center">
            {showAvatars && (
              <div className="relative -mt-12 mb-3 select-none cursor-pointer" onClick={handleAvatarClick}>
                <img
                  src={getProxyUrl(tweetData.avatar)}
                  alt={tweetData.name}
                  className="w-20 h-20 rounded-full object-cover border-4"
                  style={{ borderColor: activeTheme.cardBg, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)" }}
                />
                {isEditable && (
                  <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                )}
              </div>
            )}
            <div className="flex flex-col items-center mb-4">
              <div className="flex items-center justify-center gap-1 font-bold text-lg">
                <span {...editableProps("name")}>{tweetData.name}</span>
                {renderVerifiedBadge()}
              </div>
              <div className="text-xs opacity-60">
                @<span {...editableProps("username")}>{tweetData.username}</span>
              </div>
            </div>
            <div
              {...editableProps("text")}
              className="text-base leading-relaxed whitespace-pre-wrap text-center px-2 mb-4 italic font-light"
            >
              &ldquo;{tweetData.text}&rdquo;
            </div>
            {renderMedia()}
            {renderLinkPreview()}
            {showMetrics && renderCompactMetrics()}
          </div>
        );

      case "nova1":
        // Cyber-tech neon border style I
        return (
          <div className="flex flex-col w-full font-mono">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-dashed" style={{ borderColor: activeTheme.accent }}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeTheme.accent }}></div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: activeTheme.accent }}>
                  System Log // Post
                </span>
              </div>
              <span {...editableProps("date", "text-xs opacity-50")}>
                {tweetData.date}
              </span>
            </div>
            <div className="flex gap-3 items-start mb-3">
              {showAvatars && (
                <div className="relative select-none cursor-pointer shrink-0" onClick={handleAvatarClick}>
                  <img
                    src={getProxyUrl(tweetData.avatar)}
                    alt={tweetData.name}
                    className="w-10 h-10 rounded border"
                    style={{ borderColor: activeTheme.accent }}
                  />
                  {isEditable && (
                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                  )}
                </div>
              )}
              <div className="flex flex-col">
                <div className="flex items-center gap-1 font-bold">
                  <span {...editableProps("name")}>{tweetData.name}</span>
                  {renderVerifiedBadge()}
                </div>
                <div className="text-xs opacity-60">
                  @<span {...editableProps("username")}>{tweetData.username}</span>
                </div>
              </div>
            </div>
            <div {...editableProps("text", "text-sm leading-relaxed whitespace-pre-wrap mb-4 bg-slate-500/5 p-3 rounded border border-slate-500/10")}>
              {tweetData.text}
            </div>
            {renderMedia()}
            {renderLinkPreview()}
            {showMetrics && (
              <div className="flex justify-between text-xs opacity-60 border-t pt-2" style={{ borderColor: activeTheme.cardBorder }}>
                <span>METRICS // LKS:{tweetData.likes} RPS:{tweetData.retweets}</span>
                <span {...editableProps("source")}>{tweetData.source.toUpperCase()}</span>
              </div>
            )}
          </div>
        );

      case "nova2":
        // Neon cyber-tech with visual meters II
        return (
          <div className="flex flex-col w-full font-mono">
            <div className="flex gap-3 items-center mb-3">
              {showAvatars && (
                <div className="relative select-none cursor-pointer shrink-0" onClick={handleAvatarClick}>
                  <img
                    src={getProxyUrl(tweetData.avatar)}
                    alt={tweetData.name}
                    className="w-12 h-12 rounded-full object-cover border-2"
                    style={{ borderColor: activeTheme.accent }}
                  />
                  {isEditable && (
                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                  )}
                </div>
              )}
              <div className="flex flex-col">
                <div className="flex items-center gap-1 font-bold text-sm tracking-tight">
                  <span {...editableProps("name")}>{tweetData.name}</span>
                  {renderVerifiedBadge()}
                </div>
                <div className="text-xs opacity-50">
                  ID: @<span {...editableProps("username")}>{tweetData.username}</span>
                </div>
              </div>
            </div>
            <div {...editableProps("text", "text-sm leading-relaxed whitespace-pre-wrap py-2 mb-3 border-l-2 pl-3")} style={{ borderLeftColor: activeTheme.accent }}>
              {tweetData.text}
            </div>
            {renderMedia()}
            {renderLinkPreview()}
            <div className="flex flex-col gap-1.5 pt-2 border-t text-xs opacity-60" style={{ borderColor: activeTheme.cardBorder }}>
              <div className="flex justify-between">
                <span>ENGAGEMENT LEVEL:</span>
                <span>{tweetData.likes} PTS</span>
              </div>
              <div className="w-full h-1 bg-slate-500/20 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: "75%", backgroundColor: activeTheme.accent }}></div>
              </div>
            </div>
          </div>
        );

      case "quote":
        // Big stylized quotation marks layout
        return (
          <div className="flex flex-col w-full relative">
            <span
              className="absolute -top-6 -left-2 text-7xl font-serif select-none pointer-events-none opacity-20"
              style={{ color: activeTheme.accent }}
            >
              &ldquo;
            </span>
            <div
              {...editableProps("text")}
              className="text-lg leading-relaxed whitespace-pre-wrap pl-6 pr-2 mb-6 font-medium relative z-10"
            >
              {tweetData.text}
            </div>
            {renderMedia()}
            {renderLinkPreview()}
            <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: activeTheme.cardBorder }}>
              <div className="flex items-center gap-2">
                {showAvatars && (
                  <div className="relative select-none cursor-pointer shrink-0" onClick={handleAvatarClick}>
                    <img
                      src={getProxyUrl(tweetData.avatar)}
                      alt={tweetData.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    {isEditable && (
                      <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                    )}
                  </div>
                )}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 font-bold text-xs leading-none">
                    <span {...editableProps("name")}>{tweetData.name}</span>
                    {renderVerifiedBadge()}
                  </div>
                  <div className="text-[10px] opacity-60">
                    @<span {...editableProps("username")}>{tweetData.username}</span>
                  </div>
                </div>
              </div>
              {showMetrics && (
                <div className="text-[10px] opacity-50 font-semibold uppercase tracking-wider">
                  Likes // {tweetData.likes}
                </div>
              )}
            </div>
          </div>
        );

      case "simple":
        // Plain text clean design
        return (
          <div className="flex flex-col w-full gap-2">
            <div className="flex justify-between items-center text-xs opacity-60">
              <div className="flex items-center gap-1">
                @<span {...editableProps("username")}>{tweetData.username}</span>
                {renderVerifiedBadge()}
              </div>
              <span {...editableProps("date")}>{tweetData.date}</span>
            </div>
            <div {...editableProps("text", "text-base leading-relaxed whitespace-pre-wrap py-2 font-medium")}>
              {tweetData.text}
            </div>
            {renderMedia()}
            {renderLinkPreview()}
            {showMetrics && (
              <div className="flex gap-4 text-xs opacity-50 border-t pt-2" style={{ borderColor: activeTheme.cardBorder }}>
                <span>{tweetData.likes} Likes</span>
                <span>{tweetData.retweets} Reposts</span>
              </div>
            )}
          </div>
        );

      case "square":
        // Balanced square block
        return (
          <div className="flex flex-col w-full border-2 p-4 rounded" style={{ borderColor: activeTheme.accent }}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2.5 items-center">
                {showAvatars && (
                  <div className="relative select-none cursor-pointer shrink-0" onClick={handleAvatarClick}>
                    <img
                      src={getProxyUrl(tweetData.avatar)}
                      alt={tweetData.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {isEditable && (
                      <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                    )}
                  </div>
                )}
                <div className="flex flex-col">
                  <div className="flex items-center gap-0.5 font-bold text-xs">
                    <span {...editableProps("name")}>{tweetData.name}</span>
                    {renderVerifiedBadge()}
                  </div>
                  <div className="text-[10px] opacity-50 leading-none">
                    @<span {...editableProps("username")}>{tweetData.username}</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: activeTheme.accent }}>
                ORIGINAL
              </span>
            </div>
            <div {...editableProps("text", "text-sm leading-relaxed whitespace-pre-wrap mb-4 font-normal")}>
              {tweetData.text}
            </div>
            {renderMedia()}
            {renderLinkPreview()}
            {showMetrics && renderCompactMetrics()}
          </div>
        );

      case "highlighted":
        return (
          <div className="flex flex-col w-full items-center text-center py-4">
            {/* Logo / Twitter Icon at top */}
            <div className="opacity-40 mb-6">
              <svg viewBox="0 0 24 24" className="w-[32px] h-[32px]" style={{ fill: activeTheme.cardText }}>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>

            {/* Text content with custom marker highlight styling */}
            <div
              {...editableProps("text", "text-lg md:text-xl font-bold leading-loose text-center px-4 mb-6 relative z-10")}
            >
              <span 
                className="px-2 py-1 leading-loose"
                style={{ 
                  backgroundColor: activeTheme.accent, 
                  color: "#ffffff", 
                  boxDecorationBreak: "clone",
                  WebkitBoxDecorationBreak: "clone",
                  borderRadius: "4px"
                }}
              >
                {tweetData.text}
              </span>
            </div>
            {renderMedia()}
            {renderLinkPreview()}

            {/* Avatar and author details at bottom */}
            <div className="flex flex-col items-center mt-6 pt-4 border-t w-full" style={{ borderColor: activeTheme.cardBorder }}>
              {showAvatars && (
                <div className="relative mb-2 select-none cursor-pointer" onClick={handleAvatarClick}>
                  <img
                    src={getProxyUrl(tweetData.avatar)}
                    alt={tweetData.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-700/10"
                  />
                  {isEditable && (
                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                  )}
                </div>
              )}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 font-bold text-sm">
                  <span {...editableProps("name")}>{tweetData.name}</span>
                  {renderVerifiedBadge()}
                </div>
                <div className="text-xs opacity-50">
                  @<span {...editableProps("username")}>{tweetData.username}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "focused":
        return (
          <div className="flex flex-col w-full items-center text-center py-4">
            {/* Avatar at top center */}
            {showAvatars && (
              <div className="relative mb-3 select-none cursor-pointer" onClick={handleAvatarClick}>
                <img
                  src={getProxyUrl(tweetData.avatar)}
                  alt={tweetData.name}
                  className="w-16 h-16 rounded-full object-cover border-2"
                  style={{ borderColor: activeTheme.accent }}
                />
                {isEditable && (
                  <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                )}
              </div>
            )}

            {/* Name & Handle */}
            <div className="flex flex-col items-center mb-6">
              <div className="flex items-center gap-1 font-bold text-base leading-tight">
                <span {...editableProps("name")}>{tweetData.name}</span>
                {renderVerifiedBadge()}
              </div>
              <div className="text-sm opacity-60">
                @<span {...editableProps("username")}>{tweetData.username}</span>
              </div>
            </div>

            {/* Text Content Centered */}
            <div
              {...editableProps("text", "text-lg leading-relaxed text-center px-4 mb-6 font-normal")}
            >
              {tweetData.text}
            </div>
            {renderMedia()}
            {renderLinkPreview()}

            {/* Small X logo at bottom center */}
            <div className="opacity-30 mt-6 pt-4 border-t w-full flex justify-center" style={{ borderColor: activeTheme.cardBorder }}>
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" style={{ fill: activeTheme.cardText }}>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
          </div>
        );

      case "standard":
      default:
        // Classic Twitter Post Layout
        return (
          <div className="flex flex-col w-full">
            {/* Header: User Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {showAvatars && (
                  <div className="relative select-none cursor-pointer" onClick={handleAvatarClick}>
                    <img
                      src={getProxyUrl(tweetData.avatar)}
                      alt={tweetData.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-700/10"
                    />
                    {isEditable && (
                      <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                    )}
                  </div>
                )}
                <div className="flex flex-col">
                  <div className="flex items-center font-bold text-[15px] leading-tight">
                    <span {...editableProps("name")}>{tweetData.name}</span>
                    {renderVerifiedBadge()}
                  </div>
                  <div className="text-[14px] opacity-60">
                    @<span {...editableProps("username")}>{tweetData.username}</span>
                  </div>
                </div>
              </div>
              {/* Logo / Twitter Icon */}
              <div className="opacity-40">
                <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]" style={{ fill: activeTheme.cardText }}>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
            </div>

            {/* Text Content */}
            <div
              {...editableProps("text", "text-[16px] leading-relaxed whitespace-pre-wrap mb-4 font-normal")}
            >
              {tweetData.text}
            </div>
            {renderMedia()}
            {renderLinkPreview()}

            {/* Date and Source */}
            <div className="text-[13px] opacity-50 pb-3 border-b" style={{ borderColor: activeTheme.cardBorder }}>
              <span {...editableProps("date")}>{tweetData.date}</span>
              <span className="mx-1.5">·</span>
              <span {...editableProps("source", "font-semibold")} style={{ color: activeTheme.accent }}>
                {tweetData.source}
              </span>
            </div>

            {/* Metrics */}
            {showMetrics && (
              <div className="flex items-center gap-4 py-3 text-[13px] border-b" style={{ borderColor: activeTheme.cardBorder }}>
                <div>
                  <strong className="font-bold">{tweetData.likes}</strong>{" "}
                  <span className="opacity-60">Likes</span>
                </div>
                <div>
                  <strong className="font-bold">{tweetData.retweets}</strong>{" "}
                  <span className="opacity-60">Reposts</span>
                </div>
                <div>
                  <strong className="font-bold">{tweetData.replies}</strong>{" "}
                  <span className="opacity-60">Replies</span>
                </div>
                <div>
                  <strong className="font-bold">{tweetData.bookmarks}</strong>{" "}
                  <span className="opacity-60">Bookmarks</span>
                </div>
              </div>
            )}

            {/* Footer Action Icons */}
            {showMetrics && (
              <div className="flex justify-between items-center pt-3 text-slate-500 opacity-60">
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
                  <path d="M1.75 1.75h20.5c.966 0 1.75.784 1.75 1.75v12.5c0 .966-.784 1.75-1.75 1.75H6.2l-4 4V3.5c0-.966.784-1.75 1.75-1.75zm18.75 2h-17v11.75l2.25-2.25h14.75V3.75z" />
                </svg>
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
                  <path d="M4.5 10.75C4.5 5.626 8.626 1.5 13.75 1.5c4.717 0 8.61 3.526 9.176 8.125a1 1 0 1 1-1.984.25c-.442-3.593-3.483-6.375-7.192-6.375-3.998 0-7.25 3.252-7.25 7.25a1 1 0 1 1-2 0zm15 2.5c0 5.124-4.126 9.25-9.25 9.25-4.717 0-8.61-3.526-9.176-8.125a1 1 0 1 1 1.984-.25c.442 3.593 3.483 6.375 7.192 6.375 3.998 0 7.25-3.252 7.25-7.25a1 1 0 1 1 2 0z" />
                </svg>
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
                  <path d="M12 3.75a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5zM2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm7.024-2.923a1 1 0 1 1 1.952-.439l-.865 3.844a1 1 0 0 1-1.952.439l.865-3.844zm3.952 0a1 1 0 1 1 1.952-.439l-.865 3.844a1 1 0 0 1-1.952.439l.865-3.844z" />
                </svg>
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
                  <path d="M4 4.5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-15zm2 1h12v13H6v-13z" />
                </svg>
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
                  <path d="M12 2.5a1 1 0 0 1 1 1v11a1 1 0 0 1-2 0v-11a1 1 0 0 1 1-1zm-6 8a1 1 0 0 1 .707.293l4.586 4.586a1 1 0 0 1-1.414 1.414L6.5 13.414V20a1 1 0 0 1-2 0v-6.586l-2.379 2.379a1 1 0 0 1-1.414-1.414l4.586-4.586A1 1 0 0 1 6 10.5zm12 0a1 1 0 0 1 .707.293l4.586 4.586a1 1 0 0 1-1.414 1.414L19.5 13.414V20a1 1 0 0 1-2 0v-6.586l-2.379 2.379a1 1 0 0 1-1.414-1.414l4.586-4.586A1 1 0 0 1 18 10.5z" />
                </svg>
              </div>
            )}
          </div>
        );
    }
  };

  const renderCompactMetrics = () => {
    return (
      <div className="flex gap-3 text-[11px] opacity-50 justify-center">
        <span>{tweetData.likes} Likes</span>
        <span>·</span>
        <span>{tweetData.retweets} Reposts</span>
        <span>·</span>
        <span>{tweetData.replies} Replies</span>
      </div>
    );
  };

  return (
    <div style={cardStyle} className="font-sans group relative transition-all duration-300">
      {renderLayoutContent()}
      
      {/* Dynamic Watermark overlay */}
      {showWatermark && (
        <div 
          className="absolute bottom-2 right-3 text-[9px] font-bold tracking-wider select-none pointer-events-none opacity-40 uppercase"
          style={{ color: activeTheme.accent }}
        >
          Antigravity App
        </div>
      )}
    </div>
  );
};
