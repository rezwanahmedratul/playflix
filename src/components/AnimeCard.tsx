import { Link } from "@tanstack/react-router";
import { Play, Star } from "lucide-react";
import { type AniMedia, aniTitle, aniYear, aniPoster, aniScore } from "@/lib/anilist";

export function AnimeCard({ item }: { item: AniMedia }) {
  const title = aniTitle(item);
  const year = aniYear(item);
  const score = aniScore(item);
  const poster = aniPoster(item, "large");

  return (
    <div className="group relative flex-shrink-0 w-[160px] md:w-[180px]">
      <Link to="/anime/$id" params={{ id: String(item.id) }} className="block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-muted ring-1 ring-border/50 shadow-lg transition-all duration-300 group-hover:ring-white/60 group-hover:shadow-white/10 group-hover:shadow-2xl group-hover:-translate-y-1">
          {poster ? (
            <img src={poster} alt={title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs p-4 text-center">{title}</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-xl">
              <Play className="h-5 w-5 fill-current ml-0.5" />
            </div>
          </div>
          {score > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/80 backdrop-blur px-1.5 py-0.5 text-[11px] font-semibold">
              <Star className="h-3 w-3 fill-white text-white" />
              {score.toFixed(1)}
            </div>
          )}
          <div className="absolute top-2 left-2 rounded-md bg-white/95 text-black px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            {item.format === "MOVIE" ? "Movie" : "Anime"}
          </div>
        </div>
      </Link>
      <Link to="/anime/$id" params={{ id: String(item.id) }} className="block pt-3 px-1">
        <h3 className="text-sm font-semibold truncate group-hover:text-white transition-colors">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{year}</p>
      </Link>
    </div>
  );
}
