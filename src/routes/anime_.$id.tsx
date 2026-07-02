import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Play, Star, Calendar, Clock, Tv as TvIcon } from "lucide-react";
import { anilist, aniTitle, aniYear, aniPoster, aniScore, type AniMedia } from "@/lib/anilist";
import { AnimeRow } from "@/components/AnimeRow";

export const Route = createFileRoute("/anime_/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Watch Anime — PlayFlix` },
      { name: "description", content: `Stream anime online in HD on PlayFlix.` },
      { property: "og:url", content: `https://playflix.ratul.fun/anime/${params.id}` },
    ],
    links: [{ rel: "canonical", href: `https://playflix.ratul.fun/anime/${params.id}` }],
  }),
  component: AnimeDetail,
});

function AnimeDetail() {
  const { id } = Route.useParams();
  const q = useQuery({ queryKey: ["ani", "detail", id], queryFn: () => anilist.detail(Number(id)) });

  if (q.isLoading) return <div className="h-[60vh] rounded-2xl bg-muted animate-pulse" />;
  if (!q.data) return <div>Not found.</div>;

  const d = q.data;
  const title = aniTitle(d);
  const year = aniYear(d);
  const score = aniScore(d);
  const poster = aniPoster(d, "extraLarge");
  const banner = d.bannerImage || poster;
  const recs = (d.recommendations?.nodes || [])
    .map(n => n.mediaRecommendation)
    .filter((x): x is AniMedia => !!x);

  return (
    <div className="space-y-10 -mt-4">
      <div className="relative -mx-4 md:-mx-8 overflow-hidden">
        <div className="relative h-[50vh] md:h-[60vh]">
          {banner && <img src={banner} alt={title} className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
        </div>
        <div className="relative -mt-56 md:-mt-72 px-4 md:px-8 flex flex-col md:flex-row gap-6 items-start">
          {poster && (
            <img src={poster} alt={title} className="w-40 md:w-56 rounded-2xl border border-white/10 shadow-2xl" />
          )}
          <div className="flex-1 space-y-3 pt-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">{title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {year && <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {year}</span>}
              {d.episodes && <span className="inline-flex items-center gap-1"><TvIcon className="h-3.5 w-3.5" /> {d.episodes} eps</span>}
              {d.duration && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {d.duration}m</span>}
              {score > 0 && <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-white text-white" /> {score.toFixed(1)}</span>}
              {d.format && <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-semibold">{d.format}</span>}
              {d.status && <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-semibold">{d.status}</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {(d.genres || []).map(g => (
                <span key={g} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium">{g}</span>
              ))}
            </div>
            {d.description && (
              <p className="text-muted-foreground max-w-3xl leading-relaxed" dangerouslySetInnerHTML={{ __html: d.description }} />
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/anime-watch/$id"
                params={{ id }}
                className="inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-bold hover:bg-neutral-200 transition"
              >
                <Play className="h-4 w-4 fill-current" /> Watch Now
              </Link>
              {d.trailer && d.trailer.site === "youtube" && (
                <a
                  href={`https://www.youtube.com/watch?v=${d.trailer.id}`}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold hover:bg-white hover:text-black transition"
                >
                  Watch Trailer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {d.characters?.edges && d.characters.edges.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-2xl font-bold">Characters</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
            {d.characters.edges.map((e, i) => (
              <div key={i} className="flex-shrink-0 w-32 text-center">
                {e.node.image?.large && (
                  <img src={e.node.image.large} alt={e.node.name.full} className="w-32 h-32 rounded-full object-cover mx-auto ring-1 ring-white/10" />
                )}
                <p className="mt-2 text-sm font-semibold truncate">{e.node.name.full}</p>
                <p className="text-xs text-muted-foreground truncate">{e.role}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {recs.length > 0 && <AnimeRow title="Recommended" items={recs} />}
    </div>
  );
}
