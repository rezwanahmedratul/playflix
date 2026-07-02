import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Trash2, Play } from "lucide-react";
import { useWatchlist, watchlist } from "@/lib/watchlist";
import { IMG } from "@/lib/tmdb";

export const Route = createFileRoute("/watchlist")({
  head: () => ({
    meta: [
      { title: "My Watchlist — PlayFlix" },
      { name: "description", content: "Your saved movies, TV series and anime on PlayFlix — resume watching anytime." },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: WatchlistPage,
});

function WatchlistPage() {
  const items = useWatchlist();
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2">
          <Bookmark className="h-3.5 w-3.5" /> Library
        </p>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gradient-mono">My Watchlist</h1>
        <p className="text-muted-foreground">{items.length} saved title{items.length !== 1 ? "s" : ""}</p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 py-20 text-center space-y-3">
          <Bookmark className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-lg font-semibold">Your watchlist is empty</p>
          <p className="text-sm text-muted-foreground">Tap the + on any poster to save it here.</p>
          <Link to="/discover" className="inline-block mt-2 rounded-lg bg-white text-black px-5 py-2.5 text-sm font-bold hover:bg-white/90 transition">
            Browse titles
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((e) => (
            <div key={`${e.type}-${e.id}`} className="group relative flex gap-3 rounded-xl border border-border bg-card p-3 hover:border-white/30 transition">
              <Link to="/watch/$type/$id" params={{ type: e.type, id: String(e.id) }} className="shrink-0">
                <div className="w-24 aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                  {e.poster_path ? (
                    <img src={IMG(e.poster_path, "w300")} alt={e.title} className="h-full w-full object-cover" />
                  ) : null}
                </div>
              </Link>
              <div className="flex-1 min-w-0 flex flex-col">
                <Link to="/watch/$type/$id" params={{ type: e.type, id: String(e.id) }} className="min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    {e.type === "movie" ? "Movie" : "Series"} · {e.year}
                  </div>
                  <h3 className="font-bold truncate mt-0.5">{e.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">★ {e.vote_average.toFixed(1)}</p>
                </Link>
                <div className="mt-auto pt-2 flex gap-2">
                  <Link
                    to="/watch/$type/$id"
                    params={{ type: e.type, id: String(e.id) }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-white text-black text-xs font-bold px-3 py-1.5 hover:bg-white/90"
                  >
                    <Play className="h-3 w-3 fill-current" /> Watch
                  </Link>
                  <button
                    onClick={() => watchlist.remove(e.id, e.type)}
                    aria-label="Remove"
                    className="h-8 w-8 rounded-md border border-border hover:bg-destructive hover:text-white hover:border-destructive flex items-center justify-center transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
