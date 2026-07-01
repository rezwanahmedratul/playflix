import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Film, Tv, Sparkles, Search, Compass, Bookmark, Flame, PlayCircle, Heart, History as HistoryIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/lib/watchlist";
import { useHistory } from "@/lib/history";

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={cn("font-black tracking-tight leading-none", className)}>
      <span className="text-white">PLAY</span>
      <span className="text-neutral-500">FLIX</span>
    </span>
  );
}

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/movies", label: "Movies", icon: Film },
  { to: "/tv", label: "TV Shows", icon: Tv },
  { to: "/anime", label: "Anime", icon: Sparkles },
  { to: "/search", label: "Search", icon: Search },
] as const;

const genreLinks = [
  { name: "Action", id: 28, type: "movie" },
  { name: "Comedy", id: 35, type: "movie" },
  { name: "Horror", id: 27, type: "movie" },
  { name: "Sci-Fi", id: 878, type: "movie" },
  { name: "Romance", id: 10749, type: "movie" },
  { name: "Drama", id: 18, type: "movie" },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const wl = useWatchlist();
  const hist = useHistory();
  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-60 flex-col border-r border-border/60 bg-sidebar text-sidebar-foreground">
      <Link to="/" className="flex h-16 items-center gap-2.5 px-6 border-b border-border/60">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black">
          <PlayCircle className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <Wordmark className="text-lg" />
      </Link>
      <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-6 space-y-6">
        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Browse</p>
          <ul className="space-y-1">
            {nav.map((item) => {
              const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
              return (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-white text-black"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Library</p>
          <ul className="space-y-1">
            <li>
              <Link
                to="/history"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  pathname === "/history"
                    ? "bg-white text-black"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                )}
              >
                <HistoryIcon className="h-4 w-4 shrink-0" />
                History
                {hist.length > 0 && (
                  <span className={cn(
                    "ml-auto text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center",
                    pathname === "/history" ? "bg-black text-white" : "bg-white/10 text-foreground",
                  )}>{hist.length}</span>
                )}
              </Link>
            </li>
            <li>
              <Link
                to="/watchlist"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  pathname === "/watchlist"
                    ? "bg-white text-black"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                )}
              >
                <Bookmark className="h-4 w-4 shrink-0" />
                Watchlist
                {wl.length > 0 && (
                  <span className={cn(
                    "ml-auto text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center",
                    pathname === "/watchlist" ? "bg-black text-white" : "bg-white/10 text-foreground",
                  )}>{wl.length}</span>
                )}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Genres</p>
          <ul className="space-y-1">
            {genreLinks.map((g) => (
              <li key={g.name}>
                <Link
                  to="/genre/$type/$id"
                  params={{ type: g.type, id: String(g.id) }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
                >
                  <Flame className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  {g.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <div className="p-4 border-t border-border/60">
        <div className="rounded-xl bg-white/5 p-4 border border-white/10">
          <p className="text-[11px] text-muted-foreground leading-relaxed">Rezwan Ahmed Ratul</p>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            Built with <Heart className="h-3 w-3 fill-white text-white" />
          </p>
        </div>
      </div>
    </aside>
  );
}

export function MobileTopBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="md:hidden sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
          <PlayCircle className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <Wordmark className="text-base" />
      </div>
      <div className="flex gap-1 px-2 pb-2 overflow-x-auto scrollbar-hide">
        {nav.map((item) => {
          const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
          return (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap",
                active ? "bg-white text-black" : "bg-muted text-muted-foreground",
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
        <Link
          to="/history"
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap",
            pathname === "/history" ? "bg-white text-black" : "bg-muted text-muted-foreground",
          )}
        >
          <HistoryIcon className="h-3.5 w-3.5" />
          History
        </Link>
        <Link
          to="/watchlist"
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap",
            pathname === "/watchlist" ? "bg-white text-black" : "bg-muted text-muted-foreground",
          )}
        >
          <Bookmark className="h-3.5 w-3.5" />
          Watchlist
        </Link>
      </div>
    </div>
  );
}
