import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Star, Calendar, Clock, Play, Plus, Check, Youtube, ArrowLeft } from "lucide-react";
import { tmdbApi, IMG, getTitle, getYear, type MediaType } from "@/lib/tmdb";
import { MediaRow } from "@/components/MediaRow";
import { useIsInWatchlist, watchlist, entryFromMedia } from "@/lib/watchlist";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/title/$type/$id")({
  parseParams: (p) => {
    if (p.type !== "movie" && p.type !== "tv") throw notFound();
    return { type: p.type as MediaType, id: p.id };
  },
  loader: async ({ params, context }) => {
    try {
      const data = await context.queryClient.ensureQueryData({
        queryKey: ["detail", params.type, params.id],
        queryFn: () => tmdbApi.detail(params.type, params.id),
        staleTime: 1000 * 60 * 10,
      });
      return { data };
    } catch {
      return { data: null };
    }
  },
  head: ({ params, loaderData }) => {
    const d: any = loaderData?.data;
    const url = `https://playflix.ratul.fun/title/${params.type}/${params.id}`;
    if (!d) {
      const fallback = `Watch ${params.type === "movie" ? "Movie" : "Series"} Online Free — PlayFlix`;
      return {
        meta: [
          { title: fallback },
          { property: "og:url", content: url },
        ],
        links: [{ rel: "canonical", href: url }],
      };
    }
    const name: string = d.title || d.name || "Untitled";
    const year: string = (d.release_date || d.first_air_date || "").slice(0, 4);
    const kind = params.type === "movie" ? "Movie" : "Series";
    const genres: string = (d.genres ?? []).map((g: any) => g.name).join(", ");
    const title = `Watch ${name}${year ? ` (${year})` : ""} Online Free in HD — PlayFlix`;
    const rawDesc: string = d.overview || `Stream ${name}${year ? ` (${year})` : ""} free in HD on PlayFlix. ${genres ? genres + ". " : ""}No signup required.`;
    const desc = rawDesc.length > 300 ? rawDesc.slice(0, 297) + "..." : rawDesc;
    const image = d.backdrop_path
      ? `https://image.tmdb.org/t/p/original${d.backdrop_path}`
      : d.poster_path
      ? `https://image.tmdb.org/t/p/w780${d.poster_path}`
      : undefined;

    const jsonLd: any = {
      "@context": "https://schema.org",
      "@type": params.type === "movie" ? "Movie" : "TVSeries",
      name,
      description: rawDesc,
      url,
      image,
      genre: (d.genres ?? []).map((g: any) => g.name),
      datePublished: d.release_date || d.first_air_date || undefined,
      inLanguage: d.original_language,
      aggregateRating: d.vote_average
        ? {
            "@type": "AggregateRating",
            ratingValue: d.vote_average,
            bestRating: 10,
            ratingCount: d.vote_count || 1,
          }
        : undefined,
    };

    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: `watch ${name} online free, ${name} full ${kind.toLowerCase()}, stream ${name} hd, ${genres}` },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: params.type === "movie" ? "video.movie" : "video.tv_show" },
        { property: "og:url", content: url },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
    };
  },
  component: TitlePage,
});

function TitlePage() {
  const { type, id } = Route.useParams();
  const detail = useQuery({
    queryKey: ["detail", type, id],
    queryFn: () => tmdbApi.detail(type, id),
  });

  const d = detail.data;
  const title = d ? getTitle(d) : "";
  const year = d ? getYear(d) : "";
  const runtime = useMemo(() => {
    if (!d) return null;
    const r = d.runtime ?? (d.episode_run_time && d.episode_run_time[0]);
    return r ? `${r}m` : null;
  }, [d]);

  const inList = useIsInWatchlist(Number(id), type);
  const trailer = d?.videos?.results?.find(
    (v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"),
  );

  if (!d) {
    return <div className="h-[60vh] rounded-2xl bg-muted animate-pulse" />;
  }

  return (
    <div className="space-y-10 -mt-4">
      {/* Cinematic backdrop hero */}
      <div className="relative -mx-4 md:-mx-8 overflow-hidden">
        {d.backdrop_path && (
          <div className="absolute inset-0">
            <img
              src={IMG(d.backdrop_path, "original")}
              alt=""
              className="h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/30 to-background/70" />
          </div>
        )}
        <div className="relative px-4 md:px-8 pt-6 pb-10 md:pb-16">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to browse
          </Link>
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 md:gap-10 items-start">
            {d.poster_path && (
              <img
                src={IMG(d.poster_path, "w500")}
                alt={title}
                className="hidden md:block w-full rounded-2xl border border-border shadow-2xl"
              />
            )}
            <div className="space-y-5 max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                {type === "movie" ? "Film" : "Series"}
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gradient-mono leading-[1.02]">
                {title}
              </h1>
              {d.tagline && <p className="text-muted-foreground italic text-lg">{d.tagline}</p>}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {d.vote_average > 0 && (
                  <span className="flex items-center gap-1.5 font-semibold text-yellow-400">
                    <Star className="h-4 w-4 fill-yellow-400" /> {d.vote_average.toFixed(1)}
                  </span>
                )}
                {year && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-4 w-4" /> {year}
                  </span>
                )}
                {runtime && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" /> {runtime}
                  </span>
                )}
                {type === "tv" && d.number_of_seasons && (
                  <span className="text-muted-foreground">{d.number_of_seasons} Seasons</span>
                )}
              </div>
              {d.genres && d.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {d.genres.map((g: any) => (
                    <Link
                      key={g.id}
                      to="/genre/$type/$id"
                      params={{ type, id: String(g.id) }}
                      className="rounded-full border border-border bg-card/70 backdrop-blur px-3 py-1 text-xs font-medium hover:bg-white hover:text-black hover:border-white transition"
                    >
                      {g.name}
                    </Link>
                  ))}
                </div>
              )}
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {d.overview}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/watch/$type/$id"
                  params={{ type, id: String(id) }}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all hover:scale-[1.03]"
                >
                  <Play className="h-4 w-4 fill-current" /> Play Now
                </Link>
                {trailer && (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 backdrop-blur px-6 py-3 text-sm font-semibold hover:bg-white/20 transition"
                  >
                    <Youtube className="h-4 w-4" /> Trailer
                  </a>
                )}
                <button
                  onClick={() => watchlist.toggle(entryFromMedia(d, type))}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition",
                    inList
                      ? "bg-white text-black hover:bg-white/90"
                      : "border border-white/20 bg-white/10 backdrop-blur hover:bg-white/20",
                  )}
                >
                  {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {inList ? "In Watchlist" : "Add to Watchlist"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {d.credits?.cast && d.credits.cast.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Cast</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {d.credits.cast.slice(0, 14).map((c: any) => (
              <div key={c.id} className="w-[110px] shrink-0 text-center">
                <div className="aspect-square rounded-full overflow-hidden bg-muted border border-border mb-2">
                  {c.profile_path ? (
                    <img src={IMG(c.profile_path, "w300")} alt={c.name} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                      {c.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold truncate">{c.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{c.character}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {d?.recommendations?.results && d.recommendations.results.length > 0 && (
        <MediaRow
          title="You Might Also Like"
          items={d.recommendations.results.map((r: any) => ({ ...r, media_type: r.media_type ?? type }))}
        />
      )}
    </div>
  );
}
