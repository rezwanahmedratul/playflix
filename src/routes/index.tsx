import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { tmdbApi } from "@/lib/tmdb";
import { Hero } from "@/components/Hero";
import { MediaRow } from "@/components/MediaRow";
import { ContinueWatchingRow } from "@/components/ContinueWatchingRow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PlayFlix — Watch Movies, TV Series & Anime Free in HD" },
      { name: "description", content: "Stream unlimited movies, TV series and anime online in HD on PlayFlix. Browse trending, popular and top-rated titles — no signup, free forever." },
      { property: "og:title", content: "PlayFlix — Watch Movies, TV Series & Anime Free in HD" },
      { property: "og:description", content: "Stream unlimited movies, TV series and anime online free in HD on PlayFlix." },
      { property: "og:url", content: "https://playflix.ratul.fun/" },
    ],
    links: [{ rel: "canonical", href: "https://playflix.ratul.fun/" }],
  }),
  component: Index,
});

function Index() {
  const trending = useQuery({ queryKey: ["trending"], queryFn: () => tmdbApi.trending("week") });
  const popularMovies = useQuery({ queryKey: ["popularMovies"], queryFn: () => tmdbApi.popularMovies() });
  const popularTv = useQuery({ queryKey: ["popularTv"], queryFn: () => tmdbApi.popularTv() });
  const topMovies = useQuery({ queryKey: ["topMovies"], queryFn: () => tmdbApi.topRatedMovies() });
  const upcoming = useQuery({ queryKey: ["upcoming"], queryFn: () => tmdbApi.upcomingMovies() });

  return (
    <div className="space-y-10">
      <Hero items={trending.data?.results ?? []} />
      <ContinueWatchingRow />
      <MediaRow
        title="Trending Now"
        subtitle="What everyone's watching this week"
        items={trending.data?.results ?? []}
        viewAll={{ to: "/discover", search: { type: "movie", sort: "popularity.desc" } }}
      />
      <MediaRow
        title="Popular Movies"
        items={(popularMovies.data?.results ?? []).map(m => ({ ...m, media_type: "movie" as const }))}
        viewAll={{ to: "/movies" }}
      />
      <MediaRow
        title="Popular Series"
        items={(popularTv.data?.results ?? []).map(m => ({ ...m, media_type: "tv" as const }))}
        viewAll={{ to: "/tv" }}
      />
      <MediaRow
        title="Top Rated Films"
        items={(topMovies.data?.results ?? []).map(m => ({ ...m, media_type: "movie" as const }))}
        viewAll={{ to: "/discover", search: { type: "movie", sort: "vote_average.desc", minRating: 8 } }}
      />
      <MediaRow
        title="Coming Soon"
        items={(upcoming.data?.results ?? []).map(m => ({ ...m, media_type: "movie" as const }))}
        viewAll={{ to: "/discover", search: { type: "movie", sort: "primary_release_date.desc" } }}
      />

    </div>
  );
}
