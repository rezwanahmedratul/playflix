import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { tmdbApi } from "@/lib/tmdb";
import { MediaGrid } from "@/components/RowsGrid";
import { MediaRow } from "@/components/MediaRow";

export const Route = createFileRoute("/movies")({
  head: () => ({
    meta: [
      { title: "Watch Movies Online Free in HD — PlayFlix" },
      { name: "description", content: "Stream trending, popular and top-rated movies free in HD on PlayFlix. Browse thousands of films by genre and year — no signup required." },
      { property: "og:title", content: "Watch Movies Online Free in HD — PlayFlix" },
      { property: "og:description", content: "Stream trending, popular and top-rated movies free in HD on PlayFlix." },
      { property: "og:url", content: "https://playflix.ratul.fun/movies" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://playflix.ratul.fun/movies" }],
  }),
  component: MoviesPage,
});

function MoviesPage() {
  const trending = useQuery({ queryKey: ["trendingMovies"], queryFn: () => tmdbApi.trendingMovies() });
  const nowPlaying = useQuery({ queryKey: ["nowPlaying"], queryFn: () => tmdbApi.nowPlayingMovies() });
  const popular = useQuery({ queryKey: ["popularMoviesPage"], queryFn: () => tmdbApi.popularMovies() });
  const top = useQuery({ queryKey: ["topMoviesPage"], queryFn: () => tmdbApi.topRatedMovies() });

  const withType = (arr: any[] = []) => arr.map(m => ({ ...m, media_type: "movie" as const }));

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">Movies</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gradient-mono">Discover Cinema</h1>
        <p className="text-muted-foreground max-w-2xl">From box-office hits to hidden gems — stream thousands of films instantly.</p>
      </header>
      <MediaRow
        title="Trending This Week"
        items={withType(trending.data?.results)}
        viewAll={{ to: "/discover", search: { type: "movie", sort: "popularity.desc" } }}
      />
      <MediaRow
        title="Now Playing"
        items={withType(nowPlaying.data?.results)}
        viewAll={{ to: "/discover", search: { type: "movie", sort: "primary_release_date.desc" } }}
      />
      <MediaRow
        title="Top Rated"
        items={withType(top.data?.results)}
        viewAll={{ to: "/discover", search: { type: "movie", sort: "vote_average.desc", minRating: 8 } }}
      />

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Popular Movies</h2>
        <MediaGrid items={withType(popular.data?.results)} />
      </section>
    </div>
  );
}
