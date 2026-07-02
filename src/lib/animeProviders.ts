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
    description: "Fast HD · sub & dub",
    build: (id, ep, dub) => `https://player.videasy.net/anime/${id}/${ep}?dub=${dub}&color=ffffff`,
  },
  {
    id: "vidsrc-anime",
    name: "VidSrc",
    description: "Largest anime catalog",
    build: (id, ep, dub) => `https://vidsrc.cc/v2/embed/anime/ani${id}/${ep}/${dub ? "dub" : "sub"}`,
  },
  {
    id: "miruro",
    name: "Miruro",
    description: "AniList-native player",
    build: (id, ep, dub) => `https://www.miruro.tv/watch?id=${id}&ep=${ep}&type=${dub ? "dub" : "sub"}`,
  },
  {
    id: "animez",
    name: "AnimeZ",
    description: "Multi-source aggregator",
    build: (id, ep, dub) => `https://animez.to/embed/${id}/${ep}?type=${dub ? "dub" : "sub"}`,
  },
  {
    id: "animekai",
    name: "AnimeKai",
    description: "HD sub/dub via AniList",
    build: (id, ep, dub) => `https://animekai.to/embed/anilist/${id}/${ep}?lang=${dub ? "dub" : "sub"}`,
  },
  {
    id: "hianime",
    name: "HiAnime",
    description: "Popular sub/dub source",
    build: (id, ep, dub) => `https://hianime.to/embed/anilist-${id}?ep=${ep}&type=${dub ? "dub" : "sub"}`,
  },
  {
    id: "2anime",
    name: "2Anime",
    description: "Reliable fallback",
    build: (id, ep) => `https://2anime.xyz/embed/anilist-${id}-episode-${ep}`,
  },
];

export const defaultAnimeProviderId = "videasy";
