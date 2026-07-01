import type { MediaType } from "./tmdb";

export interface Provider {
  id: string;
  name: string;
  description: string;
  /** Emits playback progress via window.postMessage — enables resume + auto-watched. */
  supportsProgress?: boolean;
  build: (
    type: MediaType,
    tmdbId: string | number,
    season?: number,
    episode?: number,
    opts?: { resumeAt?: number },
  ) => string;
}

export const providers: Provider[] = [
  {
    id: "vidlink",
    name: "VidLink",
    description: "Fast HD · saves progress",
    supportsProgress: true,
    build: (type, id, s, e) => {
      const base =
        type === "movie"
          ? `https://vidlink.pro/movie/${id}`
          : `https://vidlink.pro/tv/${id}/${s ?? 1}/${e ?? 1}`;
      const params = new URLSearchParams({
        primaryColor: "ffffff",
        secondaryColor: "a1a1aa",
        iconColor: "ffffff",
        title: "true",
        poster: "true",
        autoplay: "false",
        nextbutton: "true",
      });
      return `${base}?${params.toString()}`;
    },
  },
  {
    id: "vidapi",
    name: "VidAPI",
    description: "Modern alt player",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://vidapi.xyz/embed/movie/${id}`
        : `https://vidapi.xyz/embed/tv/${id}&s=${s ?? 1}&e=${e ?? 1}`,
  },
  {
    id: "vidsrc",
    name: "VidSrc",
    description: "Largest catalog",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://vidsrc.xyz/embed/movie/${id}`
        : `https://vidsrc.xyz/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
  {
    id: "2embed",
    name: "2Embed",
    description: "Reliable fallback",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}&s=${s ?? 1}&e=${e ?? 1}`,
  },
];

export const defaultProviderId = "vidlink";
