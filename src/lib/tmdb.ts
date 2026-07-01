export const TMDB_API_KEY = "05902896074695709d7763505bb88b4d";
export const TMDB_BASE = "https://api.themoviedb.org/3";
export const IMG = (path: string | null, size: "w200" | "w300" | "w500" | "w780" | "original" = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : "";

export type MediaType = "movie" | "tv";

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: MediaType;
  genre_ids?: number[];
}

export interface TmdbList<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

async function tmdb<T>(path: string, params: Record<string, string | number | boolean | undefined | null> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return (await res.json()) as T;
}

// TMDB keyword IDs to exclude adult/hentai content from anime discover queries
// 155477 = anime (hentai adjacent), 158718 = hentai, 210024 = anime, 13141 = adult animation
const ANIME_ADULT_EXCLUDE = "158718|155477";


export interface DiscoverParams {
  type: MediaType;
  page?: number;
  with_genres?: string;
  sort_by?: string;
  year?: number;
  "vote_average.gte"?: number;
  with_origin_country?: string;
  with_original_language?: string;
  include_adult?: string;
}

export const tmdbApi = {
  trending: (window: "day" | "week" = "week") =>
    tmdb<TmdbList<MediaItem>>(`/trending/all/${window}`),
  trendingMovies: () => tmdb<TmdbList<MediaItem>>("/trending/movie/week"),
  trendingTv: () => tmdb<TmdbList<MediaItem>>("/trending/tv/week"),
  popularMovies: (page = 1) => tmdb<TmdbList<MediaItem>>("/movie/popular", { page }),
  topRatedMovies: (page = 1) => tmdb<TmdbList<MediaItem>>("/movie/top_rated", { page }),
  nowPlayingMovies: () => tmdb<TmdbList<MediaItem>>("/movie/now_playing"),
  upcomingMovies: () => tmdb<TmdbList<MediaItem>>("/movie/upcoming"),
  popularTv: (page = 1) => tmdb<TmdbList<MediaItem>>("/tv/popular", { page }),
  topRatedTv: (page = 1) => tmdb<TmdbList<MediaItem>>("/tv/top_rated", { page }),
  airingTodayTv: () => tmdb<TmdbList<MediaItem>>("/tv/airing_today"),
  animeSeries: (page = 1) =>
    tmdb<TmdbList<MediaItem>>("/discover/tv", {
      with_genres: 16,
      with_origin_country: "JP",
      sort_by: "popularity.desc",
      include_adult: "false",
      without_keywords: ANIME_ADULT_EXCLUDE,
      page,
    }),
  animeMovies: (page = 1) =>
    tmdb<TmdbList<MediaItem>>("/discover/movie", {
      with_genres: 16,
      with_original_language: "ja",
      sort_by: "popularity.desc",
      include_adult: "false",
      without_keywords: ANIME_ADULT_EXCLUDE,
      page,
    }),
  topRatedAnimeSeries: (page = 1) =>
    tmdb<TmdbList<MediaItem>>("/discover/tv", {
      with_genres: 16,
      with_origin_country: "JP",
      sort_by: "vote_average.desc",
      "vote_count.gte": 200,
      include_adult: "false",
      without_keywords: ANIME_ADULT_EXCLUDE,
      page,
    }),
  topRatedAnimeMovies: (page = 1) =>
    tmdb<TmdbList<MediaItem>>("/discover/movie", {
      with_genres: 16,
      with_original_language: "ja",
      sort_by: "vote_average.desc",
      "vote_count.gte": 200,
      include_adult: "false",
      without_keywords: ANIME_ADULT_EXCLUDE,
      page,
    }),
  airingAnime: (page = 1) =>
    tmdb<TmdbList<MediaItem>>("/discover/tv", {
      with_genres: 16,
      with_origin_country: "JP",
      sort_by: "first_air_date.desc",
      "first_air_date.lte": new Date().toISOString().slice(0, 10),
      "vote_count.gte": 10,
      include_adult: "false",
      without_keywords: ANIME_ADULT_EXCLUDE,
      page,
    }),
  upcomingAnime: (page = 1) => {
    const today = new Date().toISOString().slice(0, 10);
    return tmdb<TmdbList<MediaItem>>("/discover/tv", {
      with_genres: 16,
      with_origin_country: "JP",
      sort_by: "first_air_date.asc",
      "first_air_date.gte": today,
      include_adult: "false",
      without_keywords: ANIME_ADULT_EXCLUDE,
      page,
    });
  },
  classicAnime: (page = 1) =>
    tmdb<TmdbList<MediaItem>>("/discover/tv", {
      with_genres: 16,
      with_origin_country: "JP",
      sort_by: "vote_average.desc",
      "first_air_date.lte": "2005-12-31",
      "vote_count.gte": 100,
      include_adult: "false",
      without_keywords: ANIME_ADULT_EXCLUDE,
      page,
    }),
  search: (query: string, page = 1, includeAdult = false) =>
    tmdb<TmdbList<MediaItem>>("/search/multi", { query, page, include_adult: includeAdult ? "true" : "false" }),
  detail: (type: MediaType, id: string | number) =>
    tmdb<MediaDetail>(`/${type}/${id}`, { append_to_response: "credits,videos,similar,recommendations" }),
  tvSeason: (id: string | number, season: number) =>
    tmdb<TvSeason>(`/tv/${id}/season/${season}`),
  genres: (type: MediaType) => tmdb<{ genres: Genre[] }>(`/genre/${type}/list`),
  discover: (params: DiscoverParams) => {
    const { type, ...rest } = params;
    return tmdb<TmdbList<MediaItem>>(`/discover/${type}`, rest as Record<string, string | number>);
  },
};

export interface Genre { id: number; name: string }
export interface CastMember { id: number; name: string; character: string; profile_path: string | null }
export interface Video { id: string; key: string; site: string; type: string; name: string }
export interface Episode {
  id: number; name: string; overview: string; episode_number: number;
  season_number: number; still_path: string | null; air_date: string; vote_average: number; runtime: number | null;
}
export interface TvSeason { id: number; name: string; season_number: number; episodes: Episode[] }
export interface MediaDetail extends MediaItem {
  genres: Genre[];
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: { id: number; season_number: number; name: string; episode_count: number; poster_path: string | null }[];
  tagline?: string;
  status?: string;
  credits?: { cast: CastMember[] };
  videos?: { results: Video[] };
  similar?: TmdbList<MediaItem>;
  recommendations?: TmdbList<MediaItem>;
}

export function getTitle(m: MediaItem) {
  return m.title || m.name || "Untitled";
}
export function getYear(m: MediaItem) {
  const d = m.release_date || m.first_air_date;
  return d ? new Date(d).getFullYear() : "";
}
export function inferType(m: MediaItem): MediaType {
  if (m.media_type === "movie" || m.media_type === "tv") return m.media_type;
  return m.title ? "movie" : "tv";
}

// Common genre IDs (TMDB constants).
// Entries with `keyword: true` use TMDB `with_keywords` instead of `with_genres`.
export interface DiscoverGenreOption { id: number; name: string; keyword?: boolean }

export const MOVIE_GENRES: DiscoverGenreOption[] = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 210024, name: "Anime", keyword: true },
  { id: 35, name: "Comedy" },
  { id: 10683, name: "Coming-of-Age", keyword: true },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 9663, name: "Martial Arts", keyword: true },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10161, name: "Spy", keyword: true },
  { id: 9715, name: "Superhero", keyword: true },
  { id: 53, name: "Thriller" },
  { id: 10770, name: "TV Movie" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

export const TV_GENRES: DiscoverGenreOption[] = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 210024, name: "Anime", keyword: true },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 10762, name: "Kids" },
  { id: 9663, name: "Martial Arts", keyword: true },
  { id: 9648, name: "Mystery" },
  { id: 10763, name: "News" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 9715, name: "Superhero", keyword: true },
  { id: 10767, name: "Talk" },
  { id: 10768, name: "War & Politics" },
  { id: 37, name: "Western" },
];

