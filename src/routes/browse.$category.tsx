import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { tmdbApi, MOVIE_GENRES, TV_GENRES, type MediaType } from "@/lib/tmdb";
import { anilist, animeGenreOptions } from "@/lib/anilist";
import { MediaCard } from "@/components/MediaCard";
import { AnimeCard } from "@/components/AnimeCard";
import { Loader2, ArrowLeft } from "lucide-react";

type Kind = "tmdb" | "anime";

interface CategoryDef {
  slug: string;
  title: string;
  subtitle?: string;
  kind: Kind;
  mediaType?: MediaType;
  fetch: (page: number) => Promise<{ items: any[]; hasMore: boolean }>;
}

// helpers
const tmdbPage = (fn: (page: number) => Promise<any>, media: MediaType) =>
  async (page: number) => {
    const r = await fn(page);
    return { items: (r.results ?? []).map((m: any) => ({ ...m, media_type: media })), hasMore: page < (r.total_pages ?? 1) };
  };
const aniPage = (fn: (page: number, perPage: number) => Promise<any>) =>
  async (page: number) => {
    const r = await fn(page, 30);
    return { items: r.media ?? [], hasMore: !!r.pageInfo?.hasNextPage };
  };

const CATEGORIES: CategoryDef[] = [
  // Movies
  { slug: "trending-movies", title: "Trending Movies", subtitle: "What everyone is watching this week", kind: "tmdb", mediaType: "movie",
    fetch: tmdbPage((p) => tmdbApi.discover({ type: "movie", sort_by: "popularity.desc", page: p }), "movie") },
  { slug: "popular-movies", title: "Popular Movies", kind: "tmdb", mediaType: "movie",
    fetch: tmdbPage((p) => tmdbApi.popularMovies(p), "movie") },
  { slug: "top-rated-movies", title: "Top Rated Movies", subtitle: "Highest rated of all time", kind: "tmdb", mediaType: "movie",
    fetch: tmdbPage((p) => tmdbApi.topRatedMovies(p), "movie") },
  { slug: "upcoming-movies", title: "Upcoming Movies", subtitle: "Coming soon to theaters", kind: "tmdb", mediaType: "movie",
    fetch: tmdbPage((p) => tmdbApi.discover({ type: "movie", sort_by: "primary_release_date.asc", page: p, "primary_release_date.gte": new Date().toISOString().slice(0, 10) } as any), "movie") },
  { slug: "now-playing-movies", title: "Now Playing", subtitle: "In theaters now", kind: "tmdb", mediaType: "movie",
    fetch: tmdbPage((p) => tmdbApi.discover({ type: "movie", sort_by: "primary_release_date.desc", page: p }), "movie") },
  // TV
  { slug: "trending-tv", title: "Trending TV Series", subtitle: "What everyone is watching this week", kind: "tmdb", mediaType: "tv",
    fetch: tmdbPage((p) => tmdbApi.discover({ type: "tv", sort_by: "popularity.desc", page: p }), "tv") },
  { slug: "popular-tv", title: "Popular TV Series", kind: "tmdb", mediaType: "tv",
    fetch: tmdbPage((p) => tmdbApi.popularTv(p), "tv") },
  { slug: "top-rated-tv", title: "Top Rated TV Series", subtitle: "Highest rated of all time", kind: "tmdb", mediaType: "tv",
    fetch: tmdbPage((p) => tmdbApi.topRatedTv(p), "tv") },
  { slug: "airing-today", title: "Airing Today", subtitle: "New episodes today", kind: "tmdb", mediaType: "tv",
    fetch: tmdbPage((p) => tmdbApi.discover({ type: "tv", sort_by: "first_air_date.desc", page: p }), "tv") },
  // Anime
  { slug: "anime-trending", title: "Trending Anime", subtitle: "What everyone is watching", kind: "anime",
    fetch: aniPage(anilist.trending) },
  { slug: "anime-popular", title: "Popular Anime", kind: "anime", fetch: aniPage(anilist.popular) },
  { slug: "anime-top-rated", title: "Top Rated Anime", subtitle: "Highest scored on AniList", kind: "anime", fetch: aniPage(anilist.topRated) },
  { slug: "anime-season", title: "This Season", subtitle: "Currently airing", kind: "anime", fetch: aniPage(anilist.seasonNow) },
  { slug: "anime-upcoming", title: "Upcoming Anime", subtitle: "Coming soon", kind: "anime", fetch: aniPage(anilist.upcoming) },
  { slug: "anime-movies", title: "Popular Anime Movies", kind: "anime", fetch: aniPage(anilist.movies) },
  { slug: "anime-top-movies", title: "Top Rated Anime Movies", kind: "anime", fetch: aniPage(anilist.topMovies) },
  { slug: "anime-classics", title: "Classic Anime", subtitle: "Timeless favorites from before 2006", kind: "anime", fetch: aniPage(anilist.classics) },
];

function resolveCategory(slug: string): CategoryDef | undefined {
  const found = CATEGORIES.find((c) => c.slug === slug);
  if (found) return found;
  // Dynamic: movies-genre-{id}, tv-genre-{id}, anime-genre-{name}
  let m = slug.match(/^movies-genre-(\d+)$/);
  if (m) {
    const id = Number(m[1]);
    const g = MOVIE_GENRES.find((x) => x.id === id);
    if (!g) return undefined;
    return {
      slug, title: `${g.name} Movies`, kind: "tmdb", mediaType: "movie",
      fetch: tmdbPage((p) => tmdbApi.discover({ type: "movie", [g.keyword ? "with_keywords" : "with_genres"]: String(g.id), sort_by: "popularity.desc", page: p } as any), "movie"),
    };
  }
  m = slug.match(/^tv-genre-(\d+)$/);
  if (m) {
    const id = Number(m[1]);
    const g = TV_GENRES.find((x) => x.id === id);
    if (!g) return undefined;
    return {
      slug, title: `${g.name} TV Series`, kind: "tmdb", mediaType: "tv",
      fetch: tmdbPage((p) => tmdbApi.discover({ type: "tv", [g.keyword ? "with_keywords" : "with_genres"]: String(g.id), sort_by: "popularity.desc", page: p } as any), "tv"),
    };
  }
  m = slug.match(/^anime-genre-(.+)$/);
  if (m) {
    const name = decodeURIComponent(m[1]);
    const opt = animeGenreOptions.find((o) => o.name.toLowerCase() === name.toLowerCase());
    if (!opt) return undefined;
    return {
      slug, title: `${opt.name} Anime`, kind: "anime",
      fetch: async (page) => {
        const r = opt.kind === "genre"
          ? await anilist.byGenre(opt.name, page, 30)
          : await anilist.discover({ tag: opt.name, page, perPage: 30, sort: "POPULARITY_DESC" });
        return { items: r.media ?? [], hasMore: !!r.pageInfo?.hasNextPage };
      },
    };
  }
  return undefined;
}

export const Route = createFileRoute("/browse/$category")({
  loader: ({ params }) => {
    const cat = resolveCategory(params.category);
    if (!cat) throw notFound();
    return { cat };
  },
  head: ({ loaderData }) => {
    const t = loaderData?.cat?.title ?? "Browse";
    return {
      meta: [
        { title: `${t} — Watch Free in HD on PlayFlix` },
        { name: "description", content: `Browse ${t.toLowerCase()} on PlayFlix. Stream in HD, no signup required.` },
        { property: "og:title", content: `${t} — PlayFlix` },
        { property: "og:description", content: `Browse ${t.toLowerCase()} on PlayFlix.` },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="py-24 text-center space-y-4">
      <h1 className="text-3xl font-bold">Category not found</h1>
      <Link to="/" className="inline-block px-4 py-2 rounded-md bg-white text-black font-semibold">Go home</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="py-24 text-center text-muted-foreground">
      <p>Couldn't load this category.</p>
      <p className="text-xs mt-2">{String(error?.message ?? "")}</p>
    </div>
  ),
  component: BrowseCategoryPage,
});

function BrowseCategoryPage() {
  const { cat } = Route.useLoaderData();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const q = useInfiniteQuery({
    queryKey: ["browse", cat.slug],
    queryFn: ({ pageParam = 1 }) => cat.fetch(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last, all) => (last.hasMore ? all.length + 1 : undefined),
  });

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && q.hasNextPage && !q.isFetchingNextPage) {
        q.fetchNextPage();
      }
    }, { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [q.hasNextPage, q.isFetchingNextPage, q.fetchNextPage]);

  const items = q.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gradient-mono">{cat.title}</h1>
        {cat.subtitle && <p className="text-muted-foreground max-w-2xl">{cat.subtitle}</p>}
      </header>

      {q.isLoading ? (
        <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No results.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
          {cat.kind === "anime"
            ? items.map((it: any) => <AnimeCard key={it.id} item={it} />)
            : items.map((it: any) => <MediaCard key={`${it.id}-${it.media_type ?? cat.mediaType}`} item={it} />)}
        </div>
      )}

      <div ref={sentinelRef} className="h-16 flex items-center justify-center">
        {q.isFetchingNextPage && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
        {!q.hasNextPage && items.length > 0 && (
          <p className="text-xs text-muted-foreground">You've reached the end</p>
        )}
      </div>
    </div>
  );
}
