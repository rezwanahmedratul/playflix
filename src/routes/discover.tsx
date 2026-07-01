import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useMemo } from "react";
import { z } from "zod";
import { tmdbApi, MOVIE_GENRES, TV_GENRES, type MediaType, type DiscoverGenreOption } from "@/lib/tmdb";
import { anilist, animeGenreOptions } from "@/lib/anilist";
import { MediaGrid } from "@/components/RowsGrid";
import { AnimeCard } from "@/components/AnimeCard";
import { X, SlidersHorizontal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";


const searchSchema = z.object({
  type: z.enum(["movie", "tv", "anime"]).catch("movie"),
  genre: z.string().optional().catch(undefined),
  sort: z.string().catch("popularity.desc"),
  year: z.coerce.number().int().optional().catch(undefined),
  minRating: z.coerce.number().optional().catch(undefined),
  adult: z.coerce.boolean().optional().catch(undefined),
});


export const Route = createFileRoute("/discover")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Discover Movies, TV Series & Anime by Genre — PlayFlix" },
      { name: "description", content: "Discover movies, TV series and anime on PlayFlix. Filter by genre, release year, rating and popularity to find your next watch." },
      { property: "og:title", content: "Discover Movies, TV Series & Anime by Genre — PlayFlix" },
      { property: "og:description", content: "Filter thousands of titles by genre, year and rating on PlayFlix." },
      { property: "og:url", content: "https://playflix.ratul.fun/discover" },
    ],
    links: [{ rel: "canonical", href: "https://playflix.ratul.fun/discover" }],
  }),
  component: DiscoverPage,
});

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 60 }, (_, i) => currentYear - i);

const tmdbSortOptions = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "release_date.desc", label: "Newest (Movies)" },
  { value: "primary_release_date.desc", label: "Latest Release" },
  { value: "revenue.desc", label: "Top Grossing" },
];

const aniSortOptions = [
  { value: "POPULARITY_DESC", label: "Most Popular" },
  { value: "SCORE_DESC", label: "Highest Rated" },
  { value: "TRENDING_DESC", label: "Trending" },
  { value: "START_DATE_DESC", label: "Newest" },
  { value: "FAVOURITES_DESC", label: "Most Favourited" },
];

function DiscoverPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/discover" });
  const isAnime =  search.type === "animeselecting";
  const typeIsAnime = search.type === "anime";

  const set = (patch: Partial<typeof search>) => {
    navigate({ search: (prev: typeof search) => ({ ...prev, ...patch }) });
  };

  // Normalize sort when switching type
  const currentSort = useMemo(() => {
    if (typeIsAnime) {
      return aniSortOptions.find(o => o.value === search.sort) ? search.sort : "POPULARITY_DESC";
    }
    return tmdbSortOptions.find(o => o.value === search.sort) ? search.sort : "popularity.desc";
  }, [typeIsAnime, search.sort]);

  const dateField = search.type === "movie" ? "primary_release_year" : "first_air_date_year";

  const tmdbGenres: DiscoverGenreOption[] = search.type === "movie" ? MOVIE_GENRES : TV_GENRES;
  const activeTmdbGenre = tmdbGenres.find((g) => String(g.id) === search.genre);
  const activeAnimeOpt = animeGenreOptions.find((o) => o.name === search.genre);

  // TMDB query (movies / tv)
  const tmdbQuery = useInfiniteQuery({
    queryKey: ["discover", "tmdb", search],
    initialPageParam: 1,
    enabled: !typeIsAnime,
    queryFn: ({ pageParam }) => tmdbApi.discover({
      type: search.type as MediaType,
      sort_by: currentSort,
      ...(activeTmdbGenre?.keyword
        ? { with_keywords: String(activeTmdbGenre.id) }
        : { with_genres: search.genre }),
      [dateField]: search.year,
      "vote_average.gte": search.minRating,
      include_adult: search.adult ? "true" : "false",
      page: pageParam,
    } as any),
    getNextPageParam: (last) => {
      const next = last.page + 1;
      if (next > Math.min(last.total_pages, 500)) return undefined;
      return next;
    },
  });

  // AniList query (anime)
  const aniQuery = useInfiniteQuery({
    queryKey: ["discover", "anime", search],
    initialPageParam: 1,
    enabled: typeIsAnime,
    queryFn: ({ pageParam }) => anilist.discover({
      page: pageParam,
      perPage: 30,
      genre: activeAnimeOpt?.kind === "genre" ? activeAnimeOpt.name : undefined,
      tag: activeAnimeOpt?.kind === "tag" ? activeAnimeOpt.name : undefined,
      sort: currentSort,
      year: search.year,
      minScore: search.minRating,
      isAdult: !!search.adult,
    }),
    getNextPageParam: (last) => last.pageInfo.hasNextPage ? last.pageInfo.currentPage + 1 : undefined,
  });


  const tmdbItems = useMemo(
    () => (tmdbQuery.data?.pages ?? []).flatMap((p) => p.results ?? []),
    [tmdbQuery.data],
  );
  const aniItems = useMemo(
    () => (aniQuery.data?.pages ?? []).flatMap((p) => p.media ?? []),
    [aniQuery.data],
  );

  const activeQuery = typeIsAnime ? aniQuery : tmdbQuery;
  const itemCount = typeIsAnime ? aniItems.length : tmdbItems.length;
  const totalResults = typeIsAnime
    ? aniQuery.data?.pages[0]?.pageInfo.total ?? 0
    : tmdbQuery.data?.pages[0]?.total_results ?? 0;

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && activeQuery.hasNextPage && !activeQuery.isFetchingNextPage) {
        activeQuery.fetchNextPage();
      }
    }, { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [activeQuery.hasNextPage, activeQuery.isFetchingNextPage, activeQuery.fetchNextPage]);

  const activeCount = [search.genre, search.year, search.minRating].filter(Boolean).length;

  const sortOptions = typeIsAnime ? aniSortOptions : tmdbSortOptions;


  // avoid unused-var warning
  void isAnime;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Discover
        </p>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gradient-mono">Find your next favorite</h1>
        <p className="text-muted-foreground max-w-2xl">Filter by type, genre, year and rating. Sort by popularity, ratings or release date.</p>
      </header>

      <div className="rounded-2xl glass-panel p-4 md:p-5 space-y-4">
        {/* Type toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mr-1">Type</span>
          {(["movie", "tv", "anime"] as const).map((t) => (
            <button
              key={t}
              onClick={() => set({
                type: t,
                genre: undefined,
                sort: t === "anime" ? "POPULARITY_DESC" : "popularity.desc",
              })}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition",
                search.type === t ? "bg-white text-black" : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "movie" ? "Movies" : t === "tv" ? "TV Shows" : "Anime"}
            </button>
          ))}
          {activeCount > 0 && (
            <button
              onClick={() => set({ genre: undefined, year: undefined, minRating: undefined })}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" /> Clear filters ({activeCount})
            </button>
          )}
        </div>

        {/* Genre chips (scrollable so long lists don't dominate the panel) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Genre</p>
            <p className="text-[10px] text-muted-foreground/60">
              {typeIsAnime ? `${animeGenreOptions.length} options` : `${tmdbGenres.length} options`}
            </p>
          </div>
          <div className="max-h-32 overflow-y-auto rounded-xl border border-border/60 bg-background/40 p-2 pr-1 flex flex-wrap gap-2 scrollbar-thin">
            <button
              onClick={() => set({ genre: undefined })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                !search.genre ? "bg-white text-black border-white" : "border-border text-muted-foreground hover:text-foreground hover:border-white/40",
              )}
            >
              All
            </button>
            {typeIsAnime
              ? animeGenreOptions.map((opt) => (
                  <button
                    key={opt.name}
                    onClick={() => set({ genre: opt.name })}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition",
                      search.genre === opt.name ? "bg-white text-black border-white" : "border-border text-muted-foreground hover:text-foreground hover:border-white/40",
                    )}
                  >
                    {opt.name}
                  </button>
                ))
              : tmdbGenres.map((g) => (
                  <button
                    key={`${g.keyword ? "kw" : "g"}-${g.id}`}
                    onClick={() => set({ genre: String(g.id) })}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition",
                      search.genre === String(g.id) ? "bg-white text-black border-white" : "border-border text-muted-foreground hover:text-foreground hover:border-white/40",
                    )}
                  >
                    {g.name}
                  </button>
                ))}
          </div>
        </div>


        {/* Row of selects */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Sort by</span>
            <select
              value={currentSort}
              onChange={(e) => set({ sort: e.target.value })}
              className="w-full h-10 rounded-lg bg-muted border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              {sortOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Year</span>
            <select
              value={search.year ?? ""}
              onChange={(e) => set({ year: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full h-10 rounded-lg bg-muted border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="">Any year</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Min rating</span>
            <select
              value={search.minRating ?? ""}
              onChange={(e) => set({ minRating: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full h-10 rounded-lg bg-muted border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="">Any rating</option>
              {[9, 8, 7, 6, 5].map((r) => <option key={r} value={r}>{r}+ / 10</option>)}
            </select>
          </label>
        </div>

        {/* Adult toggle */}
        <label className="flex items-center justify-between gap-3 pt-3 mt-1 border-t border-border/50 cursor-pointer select-none">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground">Adult content (18+)</p>
            <p className="text-[11px] text-muted-foreground/70">Off by default. Enable to include adult titles in results.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={!!search.adult}
            onClick={() => set({ adult: search.adult ? undefined : true })}
            className={cn(
              "relative h-7 w-12 rounded-full border transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-white/40",
              search.adult ? "bg-white border-white" : "bg-neutral-800 border-neutral-700 hover:border-neutral-500",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full shadow-md transition-all",
                search.adult ? "translate-x-6 bg-black" : "translate-x-0.5 bg-white",
              )}
            />
          </button>
        </label>

      </div>

      {activeQuery.isLoading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {!activeQuery.isLoading && (
        <>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>{totalResults.toLocaleString()} results</p>
            <p>Showing {itemCount}</p>
          </div>
          {typeIsAnime ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {aniItems.map((m) => <AnimeCard key={m.id} item={m} />)}
            </div>
          ) : (
            <MediaGrid items={tmdbItems.map((m: any) => ({ ...m, media_type: search.type as MediaType }))} />
          )}
          <div ref={sentinelRef} className="h-12" />
          {activeQuery.isFetchingNextPage && (
            <div className="flex items-center justify-center py-6 text-muted-foreground gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading more…
            </div>
          )}
          {!activeQuery.hasNextPage && itemCount > 0 && (
            <p className="text-center text-xs uppercase tracking-widest text-muted-foreground py-6">
              You've reached the end
            </p>
          )}
        </>
      )}
    </div>

  );
}
