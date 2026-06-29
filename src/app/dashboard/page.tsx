"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore, THEMES } from "@/store/useAppStore";
import { Controls } from "@/components/Controls";
import { TweetCard } from "@/components/TweetCard";
import { DownloadButton } from "@/components/DownloadButton";
import { Sparkles, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";

function DashboardContent() {
  const searchParams = useSearchParams();
  const { tweetData, styleOptions, updateTweetData, loadMockTweet } = useAppStore();
  const activeTheme = THEMES[styleOptions.theme];

  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (urlParam) {
      fetchTweetData(urlParam);
    } else {
      loadMockTweet();
    }
  }, [searchParams]);

  const fetchTweetData = async (url: string) => {
    useAppStore.setState({ status: "loading" });
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tweet details");
      }

      const data = await response.json();
      if (data && data.tweet) {
        Object.entries(data.tweet).forEach(([key, value]) => {
          updateTweetData(key as any, value as any);
        });
        useAppStore.setState({ status: "success" });
      }
    } catch (err: any) {
      console.warn("API Fetch error, loading default templates instead:", err.message);
      useAppStore.setState({ 
        status: "error", 
        errorMessage: "Could not fetch tweet details. Inline editor is loaded." 
      });
      setTimeout(() => useAppStore.setState({ status: "idle" }), 4000);
    }
  };

  const getCanvasDimensions = () => {
    switch (styleOptions.size) {
      case "ig_post":
        return {
          width: "550px",
          height: "550px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        };
      case "ig_story":
        return {
          width: "360px",
          height: "640px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        };
      case "auto":
      default:
        return {
          width: "100%",
          maxWidth: "600px",
          minHeight: "250px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        };
    }
  };

  const getCanvasBackgroundStyle = (): React.CSSProperties => {
    if (!styleOptions.filled) {
      return {
        background: "transparent",
        padding: `${styleOptions.padding}px`,
        boxSizing: "border-box",
      };
    }

    return {
      backgroundColor: activeTheme.background,
      backgroundImage: activeTheme.isDark 
        ? "linear-gradient(to bottom right, rgba(255,255,255,0.03), rgba(0,0,0,0.2))"
        : "linear-gradient(to bottom right, rgba(0,0,0,0.01), rgba(0,0,0,0.05))",
      padding: `${styleOptions.padding}px`,
      boxSizing: "border-box",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    };
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#070b13] overflow-x-hidden">
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 grid-pattern pointer-events-none opacity-30"></div>
      
      {/* Glow Orbs */}
      <div className="absolute top-10 right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full glow-orb"></div>
      <div className="absolute bottom-10 left-[-10%] w-[40%] h-[40%] bg-sky-500/10 rounded-full glow-orb"></div>

      {/* Header */}
      <header className="relative z-10 w-full border-b border-slate-900 bg-[#080c14]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
          <div className="h-4 w-px bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <div className="bg-sky-500 p-1.5 rounded-lg">
              <Sparkles className="w-4 h-4 text-slate-950" />
            </div>
            <span className="text-sm font-extrabold tracking-tight text-white">
              ANTIGRAVITY WORKSPACE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            💡 Tip: Click any text/number on the card to edit inline!
          </span>
        </div>
      </header>

      {/* Workspace Area */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-6 py-8 gap-8 items-start justify-center">
        
        {/* Controls Column */}
        <div className="w-full lg:w-auto shrink-0 flex justify-center">
          <Controls />
        </div>

        {/* Canvas / Preview Column */}
        <div className="flex-1 flex flex-col items-center justify-start w-full min-h-[600px] bg-slate-950/20 border border-slate-900/60 p-8 rounded-2xl backdrop-blur-sm relative">
          
          <div className="w-full flex items-center justify-between mb-6 text-xs text-slate-500 font-semibold border-b border-slate-900 pb-3">
            <span>PREVIEW CANVAS</span>
            <span className="uppercase text-sky-400 tracking-wider">
              {styleOptions.size === "auto" ? "Responsive Aspect" : styleOptions.size === "ig_post" ? "1:1 Square" : "9:16 Story"}
            </span>
          </div>

          {/* Sizing container which forces center alignment */}
          <div className="flex-1 flex items-center justify-center w-full min-h-[450px]">
            {/* The actual exportable canvas node */}
            <div
              id="screenshot-canvas"
              style={{
                ...getCanvasDimensions(),
                ...getCanvasBackgroundStyle(),
              }}
              className="relative overflow-hidden flex items-center justify-center transition-all duration-300 border border-slate-800/40 shadow-2xl"
            >
              <TweetCard
                tweetData={tweetData}
                styleOptions={styleOptions}
                isEditable={true}
                onTweetDataChange={updateTweetData}
              />
            </div>
          </div>

          {/* Action Export Buttons */}
          <DownloadButton canvasId="screenshot-canvas" />

        </div>

      </main>

    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#070b13] text-slate-400 font-semibold text-sm">
          Loading workspace...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
