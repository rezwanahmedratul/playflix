import { useRef, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { AnimeCard } from "./AnimeCard";
import type { AniMedia } from "@/lib/anilist";

interface Props {
  title: string;
  subtitle?: string;
  items?: AniMedia[];
  viewAllTo?: string;
  viewAllSearch?: Record<string, string>;
  viewAllParams?: Record<string, string>;
}

export function AnimeRow({ title, subtitle, items, viewAllTo, viewAllSearch, viewAllParams }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setCanScroll({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  };
  useEffect(() => { update(); }, [items]);

  const scroll = (dir: "left" | "right") => {
    ref.current?.scrollBy({ left: (dir === "left" ? -1 : 1) * ref.current.clientWidth * 0.8, behavior: "smooth" });
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-3 group/row">
      <div className="flex items-end justify-between px-1">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            search={viewAllSearch as any}
            params={viewAllParams as any}
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-white transition-colors"
          >
            View more <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <div className="relative">
        <div ref={ref} onScroll={update} className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-1 px-1">
          {items.map(item => <AnimeCard key={item.id} item={item} />)}
        </div>
        {canScroll.left && (
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-white hover:text-black"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {canScroll.right && (
          <button
            onClick={() => scroll("right")}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-white hover:text-black"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </section>
  );
}
