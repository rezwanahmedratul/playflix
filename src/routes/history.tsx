import { createFileRoute, Link } from "@tanstack/react-router";
import { History as HistoryIcon, Trash2 } from "lucide-react";
import { useHistory, history } from "@/lib/history";
import { ContinueWatchingCard } from "@/components/ContinueWatchingRow";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Watch History — PlayFlix" },
      { name: "description", content: "Your recently watched movies, TV series and anime on PlayFlix." },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const items = useHistory();
  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2">
            <HistoryIcon className="h-3.5 w-3.5" /> Library
          </p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gradient-mono">Watch History</h1>
          <p className="text-muted-foreground">{items.length} recently watched title{items.length !== 1 ? "s" : ""}</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => { if (confirm("Clear entire watch history?")) history.clear(); }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-destructive hover:text-white hover:border-destructive transition"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear all
          </button>
        )}
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 py-20 text-center space-y-3">
          <HistoryIcon className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-lg font-semibold">No watch history yet</p>
          <p className="text-sm text-muted-foreground">Anything you play will show up here so you can jump back in.</p>
          <Link to="/discover" className="inline-block mt-2 rounded-lg bg-white text-black px-5 py-2.5 text-sm font-bold hover:bg-white/90 transition">
            Browse titles
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {items.map((e) => (
            <ContinueWatchingCard key={`${e.kind}-${e.id}`} e={e} />
          ))}
        </div>
      )}
    </div>
  );
}
