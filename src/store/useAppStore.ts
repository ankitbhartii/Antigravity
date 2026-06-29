import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type LayoutKey =
  | "standard"
  | "bubble1"
  | "bubble2"
  | "fab"
  | "iconic"
  | "nova1"
  | "nova2"
  | "quote"
  | "simple"
  | "square"
  | "highlighted"
  | "focused";

export type FrameKey = "none" | "macos" | "mobile";

export type SizeKey = "auto" | "ig_post" | "ig_story";

export type ThemeKey =
  | "light"
  | "dark"
  | "autumn"
  | "carnation"
  | "moon_yellow"
  | "pattens_blue"
  | "pistachio"
  | "pumpkin"
  | "sapphire"
  | "spanish_yellow";

export interface ColorTheme {
  name: string;
  background: string;
  text: string;
  accent: string;
  cardBg: string;
  cardText: string;
  cardBorder: string;
  isDark: boolean;
}

export const THEMES: Record<ThemeKey, ColorTheme> = {
  light: {
    name: "Light",
    background: "#ffffff",
    text: "#000000",
    accent: "#1d9bf0",
    cardBg: "#ffffff",
    cardText: "#0f1419",
    cardBorder: "#e1e8ed",
    isDark: false,
  },
  dark: {
    name: "Dark",
    background: "#15202b",
    text: "#ffffff",
    accent: "#1d9bf0",
    cardBg: "#192734",
    cardText: "#ffffff",
    cardBorder: "#38444d",
    isDark: true,
  },
  autumn: {
    name: "Autumn",
    background: "#3e1e20",
    text: "#f5f5f1",
    accent: "#ff7548",
    cardBg: "#4a2426",
    cardText: "#f5f5f1",
    cardBorder: "#5c2d30",
    isDark: true,
  },
  carnation: {
    name: "Carnation",
    background: "#fff5f7",
    text: "#000000",
    accent: "#fc5665",
    cardBg: "#ffffff",
    cardText: "#1a0b0d",
    cardBorder: "#ffe3e8",
    isDark: false,
  },
  moon_yellow: {
    name: "Moon Yellow",
    background: "#ffbc19",
    text: "#000000",
    accent: "#2797dd",
    cardBg: "#ffffff",
    cardText: "#000000",
    cardBorder: "#ffe4a0",
    isDark: false,
  },
  pattens_blue: {
    name: "Pattens Blue",
    background: "#d2eaf2",
    text: "#19103f",
    accent: "#fc5e3c",
    cardBg: "#ffffff",
    cardText: "#19103f",
    cardBorder: "#bce0ed",
    isDark: false,
  },
  pistachio: {
    name: "Pistachio",
    background: "#e6f4eb",
    text: "#000000",
    accent: "#41af65",
    cardBg: "#ffffff",
    cardText: "#000000",
    cardBorder: "#cceadc",
    isDark: false,
  },
  pumpkin: {
    name: "Pumpkin",
    background: "#fb5f3d",
    text: "#ffffff",
    accent: "#401a10",
    cardBg: "#ffffff",
    cardText: "#000000",
    cardBorder: "#ffdfd7",
    isDark: false,
  },
  sapphire: {
    name: "Sapphire",
    background: "#4052a3",
    text: "#ffffff",
    accent: "#fb6793",
    cardBg: "#1e295d",
    cardText: "#ffffff",
    cardBorder: "#2a397e",
    isDark: true,
  },
  spanish_yellow: {
    name: "Spanish Yellow",
    background: "#fff4dc",
    text: "#000000",
    accent: "#d1842b",
    cardBg: "#ffffff",
    cardText: "#000000",
    cardBorder: "#ffeacf",
    isDark: false,
  },
};

export interface LinkPreview {
  title: string;
  description: string;
  image: string;
  domain: string;
  url: string;
}

export interface TweetData {
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  verifiedType: "blue" | "gold" | "gray" | "none";
  text: string;
  date: string;
  source: string;
  likes: string;
  retweets: string;
  replies: string;
  quotes: string;
  bookmarks: string;
  views: string;
  images?: string[];
  linkPreview?: LinkPreview | null;
}

export interface StyleOptions {
  layout: LayoutKey;
  size: SizeKey;
  theme: ThemeKey;
  padding: number; // in pixels, e.g. 16 to 128
  rounded: number; // border radius, e.g. 0 to 32
  shadow: boolean;
  filled: boolean;
  showWatermark: boolean;
  showMetrics: boolean;
  showAvatars: boolean;
  customBgGradient: string | null;
  frame: FrameKey;
}

export interface AppState {
  status: "idle" | "loading" | "generating" | "success" | "error";
  errorMessage: string | null;
  tweetData: TweetData;
  styleOptions: StyleOptions;
  
  // Actions
  updateTweetData: (key: keyof TweetData, value: any) => void;
  updateStyleOption: <K extends keyof StyleOptions>(key: K, value: StyleOptions[K]) => void;
  setStatus: (status: AppState["status"]) => void;
  setError: (message: string | null) => void;
  loadMockTweet: () => void;
}

const DEFAULT_TWEET: TweetData = {
  name: "Antigravity",
  username: "antigravity_app",
  avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&h=150&fit=crop",
  verified: true,
  verifiedType: "blue",
  text: "Make your screenshots stand out from the crowd! Antigravity lets you convert any X/Twitter post into a gorgeous social media graphic with rich themes, custom paddings, and neat layouts. 🌌✨ Try it now!",
  date: "10:14 PM · Jun 29, 2026",
  source: "Antigravity Web Client",
  likes: "1,248",
  retweets: "342",
  replies: "89",
  quotes: "24",
  bookmarks: "512",
  views: "89.4K",
  images: [],
  linkPreview: null,
};

const DEFAULT_STYLE: StyleOptions = {
  layout: "standard",
  size: "auto",
  theme: "dark",
  padding: 48,
  rounded: 16,
  shadow: true,
  filled: true,
  showWatermark: true,
  showMetrics: true,
  showAvatars: true,
  customBgGradient: null,
  frame: "none",
};

export const useAppStore = create<AppState>()(
  immer((set) => ({
    status: "idle",
    errorMessage: null,
    tweetData: DEFAULT_TWEET,
    styleOptions: DEFAULT_STYLE,

    updateTweetData: (key, value) =>
      set((state) => {
        // @ts-ignore
        state.tweetData[key] = value;
      }),

    updateStyleOption: (key, value) =>
      set((state) => {
        state.styleOptions[key] = value;
      }),

    setStatus: (status) =>
      set((state) => {
        state.status = status;
      }),

    setError: (message) =>
      set((state) => {
        state.errorMessage = message;
        state.status = message ? "error" : "idle";
      }),

    loadMockTweet: () =>
      set((state) => {
        state.tweetData = DEFAULT_TWEET;
      }),
  }))
);
