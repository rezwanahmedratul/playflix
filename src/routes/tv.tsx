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

  const withType = (arr: any[] = []) => arr.map(m => ({ ...m, media_type: "tv" as const }));

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">TV Series</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gradient-mono">Binge the Best Shows</h1>
        <p className="text-muted-foreground max-w-2xl">Prestige dramas, comedy, reality and everything in between.</p>
      </header>
      <MediaRow
        title="Trending This Week"
        items={withType(trending.data?.results)}
        viewAll={{ to: "/discover", search: { type: "tv", sort: "popularity.desc" } }}
      />
      <MediaRow
        title="Airing Today"
        items={withType(airing.data?.results)}
        viewAll={{ to: "/discover", search: { type: "tv", sort: "primary_release_date.desc" } }}
      />
      <MediaRow
        title="Top Rated"
        items={withType(top.data?.results)}
        viewAll={{ to: "/discover", search: { type: "tv", sort: "vote_average.desc", minRating: 8 } }}
      />

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Popular Series</h2>
        <MediaGrid items={withType(popular.data?.results)} />
      </section>
    </div>
  );
}
