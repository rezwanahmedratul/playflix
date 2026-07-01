// Anime streaming providers keyed by AniList ID.
export interface AnimeProvider {
  id: string;
  name: string;
  description: string;
  build: (anilistId: number | string, episode: number, dub: boolean) => string;
}

export const animeProviders: AnimeProvider[] = [
  {
    id: "videasy",
    name: "Videasy",
    description: "Fast HD player",
    build: (id, ep, dub) => `https://player.videasy.net/anime/${id}/${ep}?dub=${dub}&color=ffffff`,
  },
  {
    id: "vidsrc-anime",
    name: "VidSrc",
    description: "Largest anime catalog",
    build: (id, ep, dub) => `https://vidsrc.cc/v2/embed/anime/ani${id}/${ep}/${dub ? "dub" : "sub"}`,
  },
  {
    id: "2anime",
    name: "2Anime",
    description: "Reliable fallback",
    build: (id, ep) => `https://2anime.xyz/embed/anilist-${id}-episode-${ep}`,
  },
];

export const defaultAnimeProviderId = "videasy";
