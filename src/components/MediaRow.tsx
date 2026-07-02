import { useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { MediaCard } from "./MediaCard";
import type { MediaItem } from "@/lib/tmdb";

export function MediaRow({
  title,
  items,
  subtitle,
  viewAll,
}: {
  title: string;
  subtitle?: string;
  items: MediaItem[];
  viewAll?: { to: string; search?: Record<string, unknown>; params?: Record<string, string> };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });
  };
  if (!items?.length) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3 px-1">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {viewAll && (
          <Link
            {...(viewAll as any)}
            className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-white hover:text-black hover:border-white transition-colors shrink-0"
          >
            View more
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      <div className="relative group/row">
        <button
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-black/70 backdrop-blur-md border border-white/10 hover:bg-white hover:text-black hover:border-white transition items-center justify-center opacity-0 group-hover/row:opacity-100 focus:opacity-100 shadow-lg"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-black/70 backdrop-blur-md border border-white/10 hover:bg-white hover:text-black hover:border-white transition items-center justify-center opacity-0 group-hover/row:opacity-100 focus:opacity-100 shadow-lg"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          {items.map((it) => (
            <MediaCard key={`${it.id}-${it.media_type ?? ""}`} item={it} />
          ))}
        </div>
      </div>
    </section>
  );
}
