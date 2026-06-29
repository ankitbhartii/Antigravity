"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
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

  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const tiltWrapperRef = useRef<HTMLDivElement>(null);
  const [hoverTilt, setHoverTilt] = useState({ x: 0, y: 0, hovering: false });

  useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      
      // Target canvas width based on current size option
      let targetWidth = 550;
      if (styleOptions.size === "ig_story") {
        targetWidth = 360;
      }
      
      const padding = 32; // padding in px
      if (containerWidth < targetWidth + padding) {
        setScale((containerWidth - padding) / targetWidth);
      } else {
        setScale(1);
      }
    };

    updateScale();
    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [styleOptions.size]);

  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (urlParam) {
      fetchTweetData(urlParam);
    } else {
      loadMockTweet();
    }
  }, [searchParams]);

  // Mouse-follow tilt handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltWrapperRef.current) return;
    const rect = tiltWrapperRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);   // -1 to 1
    const dy = (e.clientY - cy) / (rect.height / 2);  // -1 to 1
    // Max ±8 degrees of extra hover tilt on top of slider value
    setHoverTilt({ x: dy * -8, y: dx * 8, hovering: true });
  };

  const handleMouseLeave = () => {
    setHoverTilt({ x: 0, y: 0, hovering: false });
  };

  // Compute combined tilt (slider + mouse hover)
  const totalTiltX = styleOptions.tiltX + hoverTilt.x;
  const totalTiltY = styleOptions.tiltY + hoverTilt.y;
  const hasTilt = totalTiltX !== 0 || totalTiltY !== 0;

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
      <header className="relative z-10 w-full border-b border-slate-900 bg-[#080c14]/80 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Link 
            href="/" 
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <div className="h-4 w-px bg-slate-800 shrink-0"></div>
          <div className="flex items-center gap-2 min-w-0">
            <div className="bg-sky-500 p-1 sm:p-1.5 rounded-lg shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950" />
            </div>
            <span className="text-xs sm:text-sm font-extrabold tracking-tight text-white truncate">
              <span className="hidden sm:inline">ANTIGRAVITY WORKSPACE</span>
              <span className="sm:hidden">WORKSPACE</span>
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 font-medium shrink-0">
          <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
            <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            💡 Tip: Click any text/number on the card to edit inline!
          </span>
        </div>
      </header>

      {/* Workspace Area */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-8 gap-4 sm:gap-8 items-start justify-center">
        
        {/* Controls Column */}
        <div className="w-full lg:w-auto shrink-0 flex justify-center">
          <Controls />
        </div>

        {/* Canvas / Preview Column */}
        <div className="flex-1 flex flex-col items-center justify-start w-full min-h-[300px] sm:min-h-[600px] bg-slate-950/20 border border-slate-900/60 p-3 sm:p-8 rounded-2xl backdrop-blur-sm relative">
          
          <div className="hidden sm:flex w-full items-center justify-between mb-6 text-xs text-slate-500 font-semibold border-b border-slate-900 pb-3">
            <span>PREVIEW CANVAS</span>
            <span className="uppercase text-sky-400 tracking-wider">
              {styleOptions.size === "auto" ? "Responsive Aspect" : styleOptions.size === "ig_post" ? "1:1 Square" : "9:16 Story"}
            </span>
          </div>

          <div 
            ref={containerRef}
            className="flex-1 flex items-center justify-center w-full min-h-[450px] overflow-hidden py-6"
            style={{ perspective: `${styleOptions.perspective}px` }}
          >
            {/* The 3D tilt + scale wrapper */}
            <div 
              ref={tiltWrapperRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className={styleOptions.floatEffect && !hoverTilt.hovering ? "card-floating" : ""}
              style={{
                transform: `scale(${scale}) rotateX(${totalTiltX}deg) rotateY(${totalTiltY}deg)`,
                transformOrigin: "center center",
                transformStyle: "preserve-3d",
                transition: hoverTilt.hovering
                  ? "transform 0.08s ease-out"
                  : "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                width: styleOptions.size === "ig_story" ? "360px" : "550px",
                height: styleOptions.size === "ig_story" ? "640px" : styleOptions.size === "ig_post" ? "550px" : "auto",
                minHeight: styleOptions.size === "auto" ? "250px" : undefined,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                cursor: hasTilt ? "grab" : "default",
                // Floating animation via CSS filter
                filter: hasTilt
                  ? `drop-shadow(0 ${Math.abs(totalTiltX) * 2}px ${Math.abs(totalTiltX) * 3 + 20}px rgba(99,102,241,0.3)) drop-shadow(0 ${Math.abs(totalTiltY)}px ${Math.abs(totalTiltY) * 2 + 10}px rgba(0,0,0,0.5))`
                  : "none",
              }}
            >
              {/* The actual exportable canvas node */}
              <div
                id="screenshot-canvas"
                style={{
                  width: "100%",
                  height: "100%",
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

              {/* 3D side-glow edge when tilted — pure CSS illusion of depth */}
              {hasTilt && (
                <div
                  className="absolute inset-0 pointer-events-none rounded-inherit"
                  style={{
                    background: `linear-gradient(
                      ${135 + totalTiltY * 2}deg,
                      rgba(99,102,241,${Math.min(Math.abs(totalTiltY) / 60, 0.18)}) 0%,
                      transparent 40%,
                      transparent 60%,
                      rgba(0,0,0,${Math.min(Math.abs(totalTiltY) / 60, 0.25)}) 100%
                    )`,
                    borderRadius: `${styleOptions.rounded}px`,
                    mixBlendMode: "overlay",
                  }}
                />
              )}
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
