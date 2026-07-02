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
  const upcoming = useQuery({ queryKey: ["upcomingMovies"], queryFn: () => tmdbApi.upcomingMovies() });
  const action = useQuery({ queryKey: ["movG", 28], queryFn: () => tmdbApi.discover({ type: "movie", with_genres: "28", sort_by: "popularity.desc" }) });
  const comedy = useQuery({ queryKey: ["movG", 35], queryFn: () => tmdbApi.discover({ type: "movie", with_genres: "35", sort_by: "popularity.desc" }) });
  const horror = useQuery({ queryKey: ["movG", 27], queryFn: () => tmdbApi.discover({ type: "movie", with_genres: "27", sort_by: "popularity.desc" }) });
  const scifi = useQuery({ queryKey: ["movG", 878], queryFn: () => tmdbApi.discover({ type: "movie", with_genres: "878", sort_by: "popularity.desc" }) });
  const romance = useQuery({ queryKey: ["movG", 10749], queryFn: () => tmdbApi.discover({ type: "movie", with_genres: "10749", sort_by: "popularity.desc" }) });
  const animation = useQuery({ queryKey: ["movG", 16], queryFn: () => tmdbApi.discover({ type: "movie", with_genres: "16", sort_by: "popularity.desc" }) });
  const thriller = useQuery({ queryKey: ["movG", 53], queryFn: () => tmdbApi.discover({ type: "movie", with_genres: "53", sort_by: "popularity.desc" }) });
  const documentary = useQuery({ queryKey: ["movG", 99], queryFn: () => tmdbApi.discover({ type: "movie", with_genres: "99", sort_by: "popularity.desc" }) });

  const withType = (arr: any[] = []) => arr.map(m => ({ ...m, media_type: "movie" as const }));
  const g = (id: number) => ({ to: "/browse/$category", params: { category: `movies-genre-${id}` } });
  const cat = (slug: string) => ({ to: "/browse/$category", params: { category: slug } });

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">Movies</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gradient-mono">Discover Cinema</h1>
        <p className="text-muted-foreground max-w-2xl">From box-office hits to hidden gems — stream thousands of films instantly.</p>
      </header>
      <MediaRow title="Trending This Week" items={withType(trending.data?.results)} viewAll={cat("trending-movies")} />
      <MediaRow title="Now Playing" items={withType(nowPlaying.data?.results)} viewAll={cat("now-playing-movies")} />
      <MediaRow title="Top Rated" items={withType(top.data?.results)} viewAll={cat("top-rated-movies")} />
      <MediaRow title="Upcoming" items={withType(upcoming.data?.results)} viewAll={cat("upcoming-movies")} />
      <MediaRow title="Action" items={withType(action.data?.results)} viewAll={g(28)} />
      <MediaRow title="Comedy" items={withType(comedy.data?.results)} viewAll={g(35)} />
      <MediaRow title="Horror" items={withType(horror.data?.results)} viewAll={g(27)} />
      <MediaRow title="Sci-Fi" items={withType(scifi.data?.results)} viewAll={g(878)} />
      <MediaRow title="Romance" items={withType(romance.data?.results)} viewAll={g(10749)} />
      <MediaRow title="Animation" items={withType(animation.data?.results)} viewAll={g(16)} />
      <MediaRow title="Thriller" items={withType(thriller.data?.results)} viewAll={g(53)} />
      <MediaRow title="Documentary" items={withType(documentary.data?.results)} viewAll={g(99)} />

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Popular Movies</h2>
        <MediaGrid items={withType(popular.data?.results)} />
      </section>
    </div>
  );
}
