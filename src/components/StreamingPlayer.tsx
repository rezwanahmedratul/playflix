import { useState } from "react";
import { AlertCircle, Server } from "lucide-react";
import { providers, defaultProviderId } from "@/lib/providers";
import type { MediaType } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

export function StreamingPlayer({
  type,
  tmdbId,
  season,
  episode,
}: {
  type: MediaType;
  tmdbId: string | number;
  season?: number;
  episode?: number;
}) {
  const [providerId, setProviderId] = useState(defaultProviderId);
  const provider = providers.find((p) => p.id === providerId) ?? providers[0];
  const src = provider.build(type, tmdbId, season, episode);

  return (
    <div className="space-y-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-border shadow-2xl">
        <iframe
          key={src}
          src={src}
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          referrerPolicy="no-referrer"
          className="h-full w-full"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Server className="h-4 w-4" />
          <span>Server:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => setProviderId(p.id)}
              className={cn(
                "group flex flex-col items-start rounded-lg border px-4 py-2 text-left transition-all",
                p.id === providerId
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card hover:border-primary/50",
              )}
            >
              <span className="text-sm font-semibold flex items-center gap-2">
                {p.name}
                {p.id === defaultProviderId && (
                  <span className="text-[9px] uppercase tracking-wider rounded bg-primary/20 text-primary px-1 py-0.5">Default</span>
                )}
              </span>
              <span className="text-[11px] text-muted-foreground">{p.description}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-card/50 p-3 text-xs text-muted-foreground">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <p>If a video won't play or is geo-blocked, switch to another server above. Streams are provided by third-party services.</p>
      </div>
    </div>
  );
}
