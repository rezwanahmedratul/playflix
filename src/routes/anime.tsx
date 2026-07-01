import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { anilist } from "@/lib/anilist";
import { AnimeRow } from "@/components/AnimeRow";
import { AnimeCard } from "@/components/AnimeCard";

export const Route = createFileRoute("/anime")({
  head: () => ({
    meta: [
      { title: "Watch Anime Online Free in HD — PlayFlix" },
      { name: "description", content: "Stream anime series and movies free in HD on PlayFlix — powered by AniList. Subbed and dubbed, no signup." },
      { property: "og:title", content: "Watch Anime Online Free in HD — PlayFlix" },
      { property: "og:description", content: "Stream anime series and movies free in HD on PlayFlix, powered by AniList." },
      { property: "og:url", content: "https://playflix.ratul.fun/anime" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://playflix.ratul.fun/anime" }],
  }),
  component: AnimePage,
});

function AnimePage() {
  const trending = useQuery({ queryKey: ["ani", "trending"], queryFn: () => anilist.trending(1, 24) });
  const popular = useQuery({ queryKey: ["ani", "popular"], queryFn: () => anilist.popular(1, 24) });
  const topRated = useQuery({ queryKey: ["ani", "top"], queryFn: () => anilist.topRated(1, 24) });
  const seasonNow = useQuery({ queryKey: ["ani", "season"], queryFn: () => anilist.seasonNow(1, 24) });
  const upcoming = useQuery({ queryKey: ["ani", "upcoming"], queryFn: () => anilist.upcoming(1, 24) });
  const movies = useQuery({ queryKey: ["ani", "movies"], queryFn: () => anilist.movies(1, 24) });
  const topMovies = useQuery({ queryKey: ["ani", "topMovies"], queryFn: () => anilist.topMovies(1, 24) });
  const classics = useQuery({ queryKey: ["ani", "classics"], queryFn: () => anilist.classics(1, 24) });
  const action = useQuery({ queryKey: ["ani", "g", "Action"], queryFn: () => anilist.byGenre("Action", 1, 24) });
  const romance = useQuery({ queryKey: ["ani", "g", "Romance"], queryFn: () => anilist.byGenre("Romance", 1, 24) });

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">Anime · Powered by AniList</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gradient-mono">Japanese Animation</h1>
        <p className="text-muted-foreground max-w-2xl">Trending, seasonal, classics and everything in between — sourced live from AniList.</p>
      </header>

      <AnimeRow title="Trending Now" subtitle="What everyone is watching this week" items={trending.data?.media} />
      <AnimeRow title="This Season" subtitle="Currently airing" items={seasonNow.data?.media} />
      <AnimeRow title="Popular All-Time" items={popular.data?.media} />
      <AnimeRow title="Top Rated" subtitle="Highest scored on AniList" items={topRated.data?.media} />
      <AnimeRow title="Popular Anime Movies" items={movies.data?.media} />
      <AnimeRow title="Top Rated Movies" items={topMovies.data?.media} />
      <AnimeRow title="Upcoming" subtitle="Coming soon" items={upcoming.data?.media} />
      <AnimeRow title="Action" items={action.data?.media} />
      <AnimeRow title="Romance" items={romance.data?.media} />
      <AnimeRow title="Classics" subtitle="Timeless favorites from before 2006" items={classics.data?.media} />

      {popular.data?.media && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">All Popular Anime</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popular.data.media.map(m => <AnimeCard key={m.id} item={m} />)}
          </div>
        </section>
      )}
    </div>
  );
}
