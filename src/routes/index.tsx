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

const browse = (category: string) => ({ to: "/browse/$category", params: { category } });

function Index() {
  const trending = useQuery({ queryKey: ["trending"], queryFn: () => tmdbApi.trending("week") });
  const popularMovies = useQuery({ queryKey: ["popularMovies"], queryFn: () => tmdbApi.popularMovies() });
  const popularTv = useQuery({ queryKey: ["popularTv"], queryFn: () => tmdbApi.popularTv() });
  const topMovies = useQuery({ queryKey: ["topMovies"], queryFn: () => tmdbApi.topRatedMovies() });
  const upcoming = useQuery({ queryKey: ["upcoming"], queryFn: () => tmdbApi.upcomingMovies() });
  const nowPlaying = useQuery({ queryKey: ["nowPlaying"], queryFn: () => tmdbApi.nowPlayingMovies() });
  const airingToday = useQuery({ queryKey: ["airingToday"], queryFn: () => tmdbApi.airingTodayTv() });

  const newReleases = [
    ...(nowPlaying.data?.results ?? []).map(m => ({ ...m, media_type: "movie" as const })),
    ...(airingToday.data?.results ?? []).map(m => ({ ...m, media_type: "tv" as const })),
  ]
    .filter(m => m.poster_path)
    .sort((a, b) => {
      const da = new Date(a.release_date || a.first_air_date || 0).getTime();
      const db = new Date(b.release_date || b.first_air_date || 0).getTime();
      return db - da;
    });

  return (
    <div className="space-y-10">
      <Hero items={trending.data?.results ?? []} />
      <ContinueWatchingRow />
      <MediaRow
        title="Trending Now"
        subtitle="What everyone's watching this week"
        items={trending.data?.results ?? []}
        viewAll={browse("trending-movies")}
      />
      <MediaRow
        title="New Releases"
        subtitle="Fresh out this week — movies & series"
        items={newReleases}
        viewAll={browse("now-playing-movies")}
      />
      <MediaRow
        title="Popular Movies"
        items={(popularMovies.data?.results ?? []).map(m => ({ ...m, media_type: "movie" as const }))}
        viewAll={browse("popular-movies")}
      />
      <MediaRow
        title="Popular Series"
        items={(popularTv.data?.results ?? []).map(m => ({ ...m, media_type: "tv" as const }))}
        viewAll={browse("popular-tv")}
      />
      <MediaRow
        title="Top Rated Films"
        items={(topMovies.data?.results ?? []).map(m => ({ ...m, media_type: "movie" as const }))}
        viewAll={browse("top-rated-movies")}
      />
      <MediaRow
        title="Coming Soon"
        items={(upcoming.data?.results ?? []).map(m => ({ ...m, media_type: "movie" as const }))}
        viewAll={browse("upcoming-movies")}
      />

    </div>
  );
}
