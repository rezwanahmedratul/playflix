import { MediaCard } from "./MediaCard";
import type { MediaItem } from "@/lib/tmdb";

export function MediaGrid({ items }: { items: MediaItem[] }) {
  if (!items?.length) {
    return <p className="text-center text-muted-foreground py-16">No results.</p>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
      {items.map((it) => (
        <div key={`${it.id}-${it.media_type ?? ""}`} className="w-full">
          <MediaCard item={it} />
        </div>
      ))}
    </div>
  );
}
