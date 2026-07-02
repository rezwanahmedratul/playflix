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
    id: "videasy",
    name: "Videasy",
    description: "HD · saves progress",
    supportsProgress: true,
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://player.videasy.net/movie/${id}?color=ffffff`
        : `https://player.videasy.net/tv/${id}/${s ?? 1}/${e ?? 1}?color=ffffff&nextEpisode=true&episodeSelector=true`,
  },
  {
    id: "vidsrc-su",
    name: "VidSrc.su",
    description: "Multi-source auto-failover",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://vidsrc.su/embed/movie/${id}`
        : `https://vidsrc.su/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
  {
    id: "embedsu",
    name: "Embed.su",
    description: "Fast global CDN",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://embed.su/embed/movie/${id}`
        : `https://embed.su/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
  {
    id: "autoembed",
    name: "AutoEmbed",
    description: "Multi-server aggregator",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://player.autoembed.cc/embed/movie/${id}`
        : `https://player.autoembed.cc/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
  {
    id: "multiembed",
    name: "MultiEmbed",
    description: "20+ sources merged",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s ?? 1}&e=${e ?? 1}`,
  },
  {
    id: "moviesapi",
    name: "MoviesAPI",
    description: "Movie & series club",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://moviesapi.club/movie/${id}`
        : `https://moviesapi.club/tv/${id}-${s ?? 1}-${e ?? 1}`,
  },
  {
    id: "smashystream",
    name: "SmashyStream",
    description: "Multi-server, ad-lite",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://embed.smashystream.com/playere.php?tmdb=${id}`
        : `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${s ?? 1}&episode=${e ?? 1}`,
  },
  {
    id: "superembed",
    name: "SuperEmbed",
    description: "Long-standing multi-source",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${s ?? 1}&e=${e ?? 1}`,
  },
  {
    id: "rivestream",
    name: "RiveStream",
    description: "Newer premium player",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://rivestream.net/embed?type=movie&id=${id}`
        : `https://rivestream.net/embed?type=tv&id=${id}&season=${s ?? 1}&episode=${e ?? 1}`,
  },
  {
    id: "vidsrc-cc",
    name: "VidSrc.cc",
    description: "V3 player, subtitles",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://vidsrc.cc/v3/embed/movie/${id}?autoPlay=false`
        : `https://vidsrc.cc/v3/embed/tv/${id}/${s ?? 1}/${e ?? 1}?autoPlay=false`,
  },
  {
    id: "vidsrc-to",
    name: "VidSrc.to",
    description: "Legacy VidSrc",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
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
    name: "VidSrc.xyz",
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
  {
    id: "nontongo",
    name: "NontonGo",
    description: "Asian-friendly mirror",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://www.NontonGo.win/embed/movie/${id}`
        : `https://www.NontonGo.win/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
];

export const defaultProviderId = "vidlink";
