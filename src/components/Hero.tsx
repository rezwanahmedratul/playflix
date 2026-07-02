import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Play, Info, Star } from "lucide-react";
import { type MediaItem, IMG, getTitle, getYear, inferType } from "@/lib/tmdb";

export function Hero({ items }: { items: MediaItem[] }) {
  const [idx, setIdx] = useState(0);
  const slides = items.slice(0, 10);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!slides.length) return <div className="h-[60vh] bg-muted animate-pulse rounded-2xl" />;
  const current = slides[idx];
  const type = inferType(current);

  return (
    <div className="relative h-[65vh] min-h-[420px] max-h-[640px] overflow-hidden rounded-2xl bg-black">
      {slides.map((s, i) => {
        const offset = i - idx;
        return (
          <div
            key={s.id}
            className="absolute inset-0 will-change-transform"
            style={{
              transform: `translate3d(${offset * 100}%, 0, 0)`,
              transition: "transform 1100ms cubic-bezier(0.22, 1, 0.36, 1)",
              zIndex: offset === 0 ? 1 : 0,
            }}
            aria-hidden={offset !== 0}
          >
            {s.backdrop_path && (
              <img
                src={IMG(s.backdrop_path, "w780")}
                srcSet={`${IMG(s.backdrop_path, "w780")} 780w, ${IMG(s.backdrop_path, "original")} 1920w`}
                sizes="(max-width: 768px) 100vw, 1600px"
                alt={getTitle(s)}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "low"}
                decoding="async"
                className="h-full w-full object-cover hero-kenburns"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
          </div>
        );
      })}
      <div key={current.id} className="relative z-10 flex h-full flex-col justify-end p-6 md:p-12 max-w-3xl hero-content-in">
        <span className="inline-flex items-center gap-2 self-start rounded-full border border-primary/40 bg-primary/10 backdrop-blur px-3 py-1 text-xs font-semibold text-primary uppercase tracking-widest mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Featured {type === "movie" ? "Movie" : "Series"}
        </span>
        <h1 className="text-3xl md:text-6xl font-black tracking-tight text-white drop-shadow-2xl mb-3 leading-[1.05]">
          {getTitle(current)}
        </h1>
        <div className="flex items-center gap-3 mb-4 text-sm">
          {current.vote_average > 0 && (
            <span className="flex items-center gap-1 font-semibold text-yellow-400">
              <Star className="h-4 w-4 fill-yellow-400" />
              {current.vote_average.toFixed(1)}
            </span>
          )}
          <span className="text-muted-foreground">{getYear(current)}</span>
          <span className="rounded border border-border px-1.5 py-0.5 text-[11px] uppercase text-muted-foreground">HD</span>
        </div>
        <p className="text-sm md:text-base text-muted-foreground line-clamp-3 mb-6 max-w-xl">
          {current.overview}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/watch/$type/$id"
            params={{ type, id: String(current.id) }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all hover:scale-[1.03]"
          >
            <Play className="h-4 w-4 fill-current" />
            Watch Now
          </Link>
          <Link
            to="/title/$type/$id"
            params={{ type, id: String(current.id) }}
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur px-6 py-3 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 transition-all"
          >
            <Info className="h-4 w-4" />
            More Info
          </Link>

        </div>
        {slides.length > 1 && (
          <div className="flex gap-2 mt-8">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1 rounded-full transition-all ${i === idx ? "w-10 bg-primary" : "w-5 bg-white/30"}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
