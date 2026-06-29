"use client";

import React, { useState } from "react";
import { toPng, toBlob } from "html-to-image";
import { Download, Clipboard, Check, AlertCircle } from "lucide-react";

interface DownloadButtonProps {
  canvasId: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ canvasId }) => {
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const showToast = (message: string, error = false) => {
    setStatusText(message);
    setIsError(error);
    setTimeout(() => {
      setStatusText(null);
      setIsError(false);
    }, 3000);
  };

  const getCanvasElement = () => {
    const el = document.getElementById(canvasId);
    if (!el) {
      showToast("Canvas element not found", true);
      return null;
    }
    return el;
  };

  const handleDownload = async () => {
    const el = getCanvasElement();
    if (!el) return;

    setDownloading(true);
    try {
      // Small delay to ensure all images/avatars have loaded
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const dataUrl = await toPng(el, {
        pixelRatio: 3, // Premium quality upscale
        cacheBust: true,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });

      const link = document.createElement("a");
      link.download = `antigravity-tweet-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      showToast("Image downloaded successfully!");
    } catch (err: any) {
      console.error("Download failed", err);
      showToast("Download failed. Try copying to clipboard.", true);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    const el = getCanvasElement();
    if (!el) return;

    setCopying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const blob = await toBlob(el, {
        pixelRatio: 3,
        cacheBust: true,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });

      if (!blob) {
        throw new Error("Blob conversion failed");
      }

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);

      showToast("Copied to clipboard!");
    } catch (err: any) {
      console.error("Copy failed", err);
      showToast("Failed to copy image. Try downloading.", true);
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-[550px] mt-4">
      {/* Toast Notification overlay */}
      {statusText && (
        <div
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold shadow-lg z-50 self-center ${
            isError
              ? "bg-rose-950/80 border-rose-800 text-rose-300"
              : "bg-emerald-950/80 border-emerald-800 text-emerald-300"
          }`}
        >
          {isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
          {statusText}
        </div>
      )}

      <div className="flex gap-2 sm:gap-3 w-full">
        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={downloading || copying}
          className="flex-1 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold py-3 px-4 sm:px-6 rounded-xl transition-all shadow-lg hover:shadow-sky-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer text-sm sm:text-base"
        >
          <Download className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-y-0.5 transition-transform shrink-0" />
          <span className="hidden sm:inline">{downloading ? "Exporting..." : "Download PNG"}</span>
          <span className="sm:hidden">{downloading ? "Exporting..." : "Download"}</span>
        </button>

        {/* Copy to Clipboard */}
        <button
          onClick={handleCopyToClipboard}
          disabled={downloading || copying}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold py-3 px-3 sm:px-5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
          title="Copy Image to Clipboard"
        >
          <Clipboard className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
          <span className="hidden sm:inline">{copying ? "Copying..." : "Copy"}</span>
        </button>
      </div>
    </div>
  );
};
