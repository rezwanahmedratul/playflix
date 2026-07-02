import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Play, ArrowLeft, Info, CheckCircle2, RotateCcw } from "lucide-react";
import { tmdbApi, IMG, getTitle, getYear, type MediaType } from "@/lib/tmdb";
import { StreamingPlayer } from "@/components/StreamingPlayer";
import { history, useHistory, progressPercent } from "@/lib/history";
import { usePlayerProgress } from "@/lib/usePlayerProgress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/watch/$type/$id")({
  parseParams: (p) => {
    if (p.type !== "movie" && p.type !== "tv") throw notFound();
    return { type: p.type as MediaType, id: p.id };
  },
  head: ({ params }) => {
    const canonical = `https://playflix.ratul.fun/title/${params.type}/${params.id}`;
    return {
      meta: [
        { title: `Now Playing — PlayFlix` },
        { name: "robots", content: "noindex, follow" },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: WatchPage,
});

function WatchPage() {
  const { type, id } = Route.useParams();
  const allHistory = useHistory();
  const existing = allHistory.find((e) => e.kind === type && String(e.id) === String(id));

  // Resume from stored season/episode for TV shows.
  const [season, setSeason] = useState<number>(existing?.season ?? 1);
  const [episode, setEpisode] = useState<number>(existing?.episode ?? 1);

  const detail = useQuery({
    queryKey: ["detail", type, id],
    queryFn: () => tmdbApi.detail(type, id),
  });

  const seasonData = useQuery({
    queryKey: ["season", id, season],
    queryFn: () => tmdbApi.tvSeason(id, season),
    enabled: type === "tv" && !!detail.data,
  });

  const d = detail.data;
  const title = d ? getTitle(d) : "";
  const year = d ? getYear(d) : "";

  useEffect(() => {
    if (!d) return;
    history.upsert({
      kind: type,
      id: d.id,
      title: getTitle(d),
      poster_path: d.poster_path ?? null,
      backdrop_path: d.backdrop_path ?? null,
      year: getYear(d),
      vote_average: d.vote_average,
      season: type === "tv" ? season : undefined,
      episode: type === "tv" ? episode : undefined,
    });
  }, [d, type, season, episode]);

  // Live progress from the streaming provider (postMessage).
  usePlayerProgress({
    kind: type,
    id,
    season: type === "tv" ? season : undefined,
    episode: type === "tv" ? episode : undefined,
    onEpisodeChange: (s, e) => {
      if (type === "tv" && s !== undefined && s !== season) setSeason(s);
      if (e !== undefined && e !== episode) setEpisode(e);
    },
  });

  const pct = existing ? Math.round(progressPercent(existing) * 100) : 0;
  const isWatched = !!existing?.watched;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          to="/title/$type/$id"
          params={{ type, id }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to details
        </Link>
        {d && (
          <Link
            to="/title/$type/$id"
            params={{ type, id }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-white hover:text-black hover:border-white transition"
          >
            <Info className="h-3.5 w-3.5" /> More info
          </Link>
        )}
      </div>

      <StreamingPlayer type={type} tmdbId={id} season={type === "tv" ? season : undefined} episode={type === "tv" ? episode : undefined} />

      {d && (
        <div className="flex items-start gap-4">
          {d.poster_path && (
            <img
              src={IMG(d.poster_path, "w300")}
              alt={title}
              className="hidden sm:block w-24 rounded-lg border border-border"
            />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              {title}
              {year && <span className="text-muted-foreground font-normal ml-2">({year})</span>}
            </h1>
            {type === "tv" && (
              <p className="text-sm text-muted-foreground mt-1">
                Season {season} · Episode {episode}
              </p>
            )}
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
                  onClick={() => history.markWatched(type, id, false)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold hover:bg-white/10 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Mark as unwatched
                </button>
              ) : (
                <button
                  onClick={() => history.markWatched(type, id, true)}
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
        </div>
      )}

      {type === "tv" && d?.seasons && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-2xl font-bold">Episodes</h2>
            <select
              value={season}
              onChange={(e) => { setSeason(Number(e.target.value)); setEpisode(1); }}
              className="rounded-lg bg-card border border-border px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {d.seasons.filter((s: any) => s.season_number > 0).map((s: any) => (
                <option key={s.id} value={s.season_number}>
                  {s.name} ({s.episode_count} eps)
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {seasonData.data?.episodes.map((ep: any) => (
              <button
                key={ep.id}
                onClick={() => setEpisode(ep.episode_number)}
                className={cn(
                  "group flex gap-3 rounded-xl border p-2 text-left transition-all",
                  ep.episode_number === episode
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50",
                )}
              >
                <div className="relative w-32 aspect-video shrink-0 overflow-hidden rounded-lg bg-muted">
                  {ep.still_path ? (
                    <img src={IMG(ep.still_path, "w300")} alt={ep.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition">
                    <Play className="h-6 w-6 fill-white text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <p className="text-xs font-semibold text-primary">Episode {ep.episode_number}</p>
                  <p className="text-sm font-semibold truncate">{ep.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{ep.overview}</p>
                </div>
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
