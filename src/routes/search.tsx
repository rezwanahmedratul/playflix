import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { tmdbApi } from "@/lib/tmdb";
import { anilist } from "@/lib/anilist";
import { MediaGrid } from "@/components/RowsGrid";
import { AnimeCard } from "@/components/AnimeCard";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search Movies, TV Series & Anime — PlayFlix" },
      { name: "description", content: "Search thousands of movies, TV series and anime to stream free in HD on PlayFlix." },
      { property: "og:title", content: "Search Movies, TV Series & Anime — PlayFlix" },
      { property: "og:description", content: "Find any movie, series or anime and stream instantly on PlayFlix." },
      { property: "og:url", content: "https://playflix.ratul.fun/search" },
    ],
    links: [{ rel: "canonical", href: "https://playflix.ratul.fun/search" }],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [includeAdult, setIncludeAdult] = useState(false);
  const tmdb = useQuery({
    queryKey: ["search", debounced, includeAdult],
    queryFn: () => tmdbApi.search(debounced, 1, includeAdult),
    enabled: debounced.length >= 2,
  });
  const ani = useQuery({
    queryKey: ["search", "anime", debounced, includeAdult],
    queryFn: () => anilist.search(debounced, includeAdult, 1, 24),
    enabled: debounced.length >= 2,
  });

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">Search</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gradient-mono">Find something to watch</h1>
      </header>
      <div className="relative max-w-2xl">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            const v = e.target.value;
            setQuery(v);
            window.clearTimeout((window as any).__searchT);
            (window as any).__searchT = window.setTimeout(() => setDebounced(v.trim()), 300);
          }}
          placeholder="Search movies, series, anime, actors…"
          className="w-full h-14 rounded-xl bg-card border border-border pl-12 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
        />
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
        <input
          type="checkbox"
          checked={includeAdult}
          onChange={(e) => setIncludeAdult(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        Include adult results (18+)
      </label>
      {debounced.length < 2 && (
        <p className="text-muted-foreground">Type at least 2 characters to search.</p>
      )}
      {(tmdb.isFetching || ani.isFetching) && <p className="text-muted-foreground">Searching…</p>}

      {ani.data && ani.data.media.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">Anime · {ani.data.pageInfo.total.toLocaleString()} results</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {ani.data.media.map(m => <AnimeCard key={m.id} item={m} />)}
          </div>
        </section>
      )}

      {tmdb.data && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Movies & TV · {tmdb.data.total_results.toLocaleString()} results
          </h2>
          <MediaGrid
            items={(tmdb.data.results ?? []).filter((r) => r.media_type === "movie" || r.media_type === "tv")}
          />
        </section>
      )}
    </div>
  );
}

