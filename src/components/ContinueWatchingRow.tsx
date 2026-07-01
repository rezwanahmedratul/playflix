import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Play, X, History as HistoryIcon, CheckCircle2 } from "lucide-react";
import { IMG } from "@/lib/tmdb";
import { useHistory, history, progressPercent, type HistoryEntry } from "@/lib/history";
import { cn } from "@/lib/utils";

function posterOf(e: HistoryEntry) {
  if (e.posterUrl) return e.posterUrl;
  if (e.poster_path) return IMG(e.poster_path, "w500");
  return "";
}
function backdropOf(e: HistoryEntry) {
  if (e.bannerUrl) return e.bannerUrl;
  if (e.backdrop_path) return IMG(e.backdrop_path, "w780");
  return posterOf(e);
}

export function ContinueWatchingCard({ e, showRemove = true }: { e: HistoryEntry; showRemove?: boolean }) {
  const isAnime = e.kind === "anime";
  const to = isAnime ? "/anime-watch/$id" : "/watch/$type/$id";
  const params = isAnime ? { id: String(e.id) } : { type: e.kind, id: String(e.id) };
  const label =
    e.kind === "movie" ? "Movie" : e.kind === "tv" ? `S${e.season ?? 1} · E${e.episode ?? 1}` : e.episode ? `Ep ${e.episode}` : "Anime";
  const bg = backdropOf(e);
  return (
    <div className="group relative flex-shrink-0 w-[280px] md:w-[320px]">
      <Link to={to} params={params as any} className="block">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-muted ring-1 ring-border/50 shadow-lg transition-all duration-300 group-hover:ring-white/60 group-hover:shadow-white/10 group-hover:shadow-2xl group-hover:-translate-y-1">
          {bg ? (
            <img src={bg} alt={e.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs p-4 text-center">{e.title}</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute top-2 left-2 rounded-md bg-white/95 text-black px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            {e.kind === "movie" ? "Movie" : e.kind === "tv" ? "Series" : "Anime"}
          </div>
          {e.watched && (
            <div className="absolute top-2 right-9 inline-flex items-center gap-1 rounded-md bg-white text-black px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              <CheckCircle2 className="h-3 w-3" /> Watched
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-xl">
              <Play className="h-6 w-6 fill-current ml-0.5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-[10px] uppercase tracking-widest text-white/70 font-semibold">{label}</p>
            <h3 className="text-sm font-bold text-white truncate">{e.title}</h3>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div className="h-full bg-white" style={{ width: `${Math.max(5, Math.round(progressPercent(e) * 100))}%` }} />
          </div>
        </div>
      </Link>
      {showRemove && (
        <button
          onClick={(ev) => { ev.preventDefault(); ev.stopPropagation(); history.remove(e.kind, e.id); }}
          aria-label="Remove from history"
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/70 backdrop-blur border border-white/20 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black transition-all flex items-center justify-center"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function ContinueWatchingRow() {
  const all = useHistory();
  // Hide fully-watched items from Continue Watching (they're still visible on /history).
  const items = all.filter((e) => !e.watched);
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });
  };
  if (!items.length) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3 px-1">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
            <HistoryIcon className="h-5 w-5 text-muted-foreground" /> Continue Watching
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Pick up where you left off</p>
        </div>
        <Link to="/history" className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-white hover:text-black hover:border-white transition-colors shrink-0">
          View all
        </Link>
      </div>
      <div className="relative group/row">
        <button
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          className={cn("hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-black/70 backdrop-blur-md border border-white/10 hover:bg-white hover:text-black hover:border-white transition items-center justify-center opacity-0 group-hover/row:opacity-100 focus:opacity-100 shadow-lg")}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          className={cn("hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-black/70 backdrop-blur-md border border-white/10 hover:bg-white hover:text-black hover:border-white transition items-center justify-center opacity-0 group-hover/row:opacity-100 focus:opacity-100 shadow-lg")}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          {items.map((e) => (
            <ContinueWatchingCard key={`${e.kind}-${e.id}`} e={e} />
          ))}
        </div>
      </div>
    </section>
  );
}
