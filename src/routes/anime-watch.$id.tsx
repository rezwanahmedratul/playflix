import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Info, CheckCircle2, RotateCcw } from "lucide-react";
import { anilist, aniTitle, aniYear } from "@/lib/anilist";
import { animeProviders, defaultAnimeProviderId } from "@/lib/animeProviders";
import { history, useHistory, progressPercent } from "@/lib/history";
import { usePlayerProgress } from "@/lib/usePlayerProgress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/anime-watch/$id")({
  head: ({ params }) => ({
    meta: [
      { title: "Now Playing — PlayFlix" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: `https://playflix.ratul.fun/anime/${params.id}` }],
  }),
  component: WatchAnime,
});

function WatchAnime() {
  const { id } = Route.useParams();
  const allHistory = useHistory();
  const existing = allHistory.find((e) => e.kind === "anime" && String(e.id) === String(id));
  const [episode, setEpisode] = useState<number>(existing?.episode ?? 1);
  const [dub, setDub] = useState(false);
  const [providerId, setProviderId] = useState(defaultAnimeProviderId);

  const q = useQuery({ queryKey: ["ani", "detail", id], queryFn: () => anilist.detail(Number(id)) });
  const d = q.data;
  const title = d ? aniTitle(d) : "";
  const year = d ? aniYear(d) : "";
  const totalEps = d?.episodes || 12;

  useEffect(() => {
    if (!d) return;
    history.upsert({
      kind: "anime",
      id: d.id,
      title: aniTitle(d),
      posterUrl: d.coverImage?.extraLarge || d.coverImage?.large || null,
      bannerUrl: d.bannerImage || null,
      year: aniYear(d),
      vote_average: d.averageScore ? d.averageScore / 10 : undefined,
      episode: d.format === "MOVIE" ? undefined : episode,
      totalEpisodes: d.episodes ?? undefined,
    });
  }, [d, episode]);

  usePlayerProgress({
    kind: "anime",
    id,
    episode: d?.format === "MOVIE" ? undefined : episode,
    onEpisodeChange: (_s, e) => {
      if (e !== undefined && e !== episode) setEpisode(e);
    },
  });

  const pct = existing ? Math.round(progressPercent(existing) * 100) : 0;
  const isWatched = !!existing?.watched;

  const provider = animeProviders.find(p => p.id === providerId) || animeProviders[0];
  const src = provider.build(id, episode, dub);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link to="/anime/$id" params={{ id }} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to details
        </Link>
        <Link to="/anime/$id" params={{ id }} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-white hover:text-black hover:border-white transition">
          <Info className="h-3.5 w-3.5" /> More info
        </Link>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
        <iframe
          key={src}
          src={src}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Server</span>
          {animeProviders.map(p => (
            <button
              key={p.id}
              onClick={() => setProviderId(p.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                providerId === p.id ? "border-white bg-white text-black" : "border-white/20 bg-white/5 hover:bg-white/10",
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setDub(false)}
            className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold", !dub ? "border-white bg-white text-black" : "border-white/20 bg-white/5")}
          >Sub</button>
          <button
            onClick={() => setDub(true)}
            className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold", dub ? "border-white bg-white text-black" : "border-white/20 bg-white/5")}
          >Dub</button>
        </div>
      </div>

      {d && (
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            {title}
            {year && <span className="text-muted-foreground font-normal ml-2">({year})</span>}
          </h1>
          {d.format !== "MOVIE" && <p className="text-sm text-muted-foreground mt-1">Episode {episode}</p>}
          {existing?.progress && existing.progress.duration > 0 && (
            <div className="mt-3 max-w-md">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">
                <span>{isWatched ? "Watched" : `Resumed at ${pct}%`}</span>
                <span>{formatTime(existing.progress.watched)} / {formatTime(existing.progress.duration)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-white" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {isWatched ? (
              <button
                onClick={() => history.markWatched("anime", id, false)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold hover:bg-white/10 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Mark as unwatched
              </button>
            ) : (
              <button
                onClick={() => history.markWatched("anime", id, true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold hover:bg-white hover:text-black hover:border-white transition"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Mark as watched
              </button>
            )}
            {isWatched && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white text-black px-3 py-1.5 text-xs font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Watched
              </span>
            )}
          </div>
        </div>
      )}

      {d?.format !== "MOVIE" && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Episodes</h2>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
            {Array.from({ length: totalEps }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setEpisode(n)}
                className={cn(
                  "aspect-square rounded-lg text-sm font-bold border transition",
                  episode === n ? "border-white bg-white text-black" : "border-white/15 bg-white/5 hover:bg-white/10",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  const mm = m.toString().padStart(h > 0 ? 2 : 1, "0");
  const ss = s.toString().padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
