import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { tmdbApi } from "@/lib/tmdb";
import { MediaGrid } from "@/components/RowsGrid";
import { MediaRow } from "@/components/MediaRow";

export const Route = createFileRoute("/tv")({
  head: () => ({
    meta: [
      { title: "Watch TV Series Online Free in HD — PlayFlix" },
      { name: "description", content: "Stream popular, top-rated and currently airing TV series free in HD on PlayFlix. Binge full seasons with no signup." },
      { property: "og:title", content: "Watch TV Series Online Free in HD — PlayFlix" },
      { property: "og:description", content: "Stream popular, top-rated and currently airing TV series free in HD on PlayFlix." },
      { property: "og:url", content: "https://playflix.ratul.fun/tv" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://playflix.ratul.fun/tv" }],
  }),
  component: TvPage,
});

function TvPage() {
  const trending = useQuery({ queryKey: ["trendingTv"], queryFn: () => tmdbApi.trendingTv() });
  const airing = useQuery({ queryKey: ["airingToday"], queryFn: () => tmdbApi.airingTodayTv() });
  const popular = useQuery({ queryKey: ["popularTvPage"], queryFn: () => tmdbApi.popularTv() });
  const top = useQuery({ queryKey: ["topTvPage"], queryFn: () => tmdbApi.topRatedTv() });
  const actionAdv = useQuery({ queryKey: ["tvG", 10759], queryFn: () => tmdbApi.discover({ type: "tv", with_genres: "10759", sort_by: "popularity.desc" }) });
  const drama = useQuery({ queryKey: ["tvG", 18], queryFn: () => tmdbApi.discover({ type: "tv", with_genres: "18", sort_by: "popularity.desc" }) });
  const comedy = useQuery({ queryKey: ["tvG", 35], queryFn: () => tmdbApi.discover({ type: "tv", with_genres: "35", sort_by: "popularity.desc" }) });
  const crime = useQuery({ queryKey: ["tvG", 80], queryFn: () => tmdbApi.discover({ type: "tv", with_genres: "80", sort_by: "popularity.desc" }) });
  const scifi = useQuery({ queryKey: ["tvG", 10765], queryFn: () => tmdbApi.discover({ type: "tv", with_genres: "10765", sort_by: "popularity.desc" }) });
  const mystery = useQuery({ queryKey: ["tvG", 9648], queryFn: () => tmdbApi.discover({ type: "tv", with_genres: "9648", sort_by: "popularity.desc" }) });
  const reality = useQuery({ queryKey: ["tvG", 10764], queryFn: () => tmdbApi.discover({ type: "tv", with_genres: "10764", sort_by: "popularity.desc" }) });
  const documentary = useQuery({ queryKey: ["tvG", 99], queryFn: () => tmdbApi.discover({ type: "tv", with_genres: "99", sort_by: "popularity.desc" }) });
  const kids = useQuery({ queryKey: ["tvG", 10762], queryFn: () => tmdbApi.discover({ type: "tv", with_genres: "10762", sort_by: "popularity.desc" }) });

  const withType = (arr: any[] = []) => arr.map(m => ({ ...m, media_type: "tv" as const }));
  const g = (id: number) => ({ to: "/browse/$category", params: { category: `tv-genre-${id}` } });
  const cat = (slug: string) => ({ to: "/browse/$category", params: { category: slug } });

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">TV Series</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gradient-mono">Binge the Best Shows</h1>
        <p className="text-muted-foreground max-w-2xl">Prestige dramas, comedy, reality and everything in between.</p>
      </header>
      <MediaRow title="Trending This Week" items={withType(trending.data?.results)} viewAll={cat("trending-tv")} />
      <MediaRow title="Airing Today" items={withType(airing.data?.results)} viewAll={cat("airing-today")} />
      <MediaRow title="Top Rated" items={withType(top.data?.results)} viewAll={cat("top-rated-tv")} />
      <MediaRow title="Action & Adventure" items={withType(actionAdv.data?.results)} viewAll={g(10759)} />
      <MediaRow title="Drama" items={withType(drama.data?.results)} viewAll={g(18)} />
      <MediaRow title="Comedy" items={withType(comedy.data?.results)} viewAll={g(35)} />
      <MediaRow title="Crime" items={withType(crime.data?.results)} viewAll={g(80)} />
      <MediaRow title="Sci-Fi & Fantasy" items={withType(scifi.data?.results)} viewAll={g(10765)} />
      <MediaRow title="Mystery" items={withType(mystery.data?.results)} viewAll={g(9648)} />
      <MediaRow title="Reality" items={withType(reality.data?.results)} viewAll={g(10764)} />
      <MediaRow title="Documentary" items={withType(documentary.data?.results)} viewAll={g(99)} />
      <MediaRow title="Kids" items={withType(kids.data?.results)} viewAll={g(10762)} />

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Popular Series</h2>
        <MediaGrid items={withType(popular.data?.results)} />
      </section>
    </div>
  );
}
