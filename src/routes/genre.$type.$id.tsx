import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { z } from "zod";
import { tmdbApi, MOVIE_GENRES, TV_GENRES, type MediaType } from "@/lib/tmdb";
import { MediaGrid } from "@/components/RowsGrid";
import { ChevronLeft, ChevronRight } from "lucide-react";

const searchSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
});

export const Route = createFileRoute("/genre/$type/$id")({
  validateSearch: searchSchema,
  parseParams: (p) => {
    if (p.type !== "movie" && p.type !== "tv") throw notFound();
    return { type: p.type as MediaType, id: p.id };
  },
  head: ({ params }) => {
    const list = params.type === "movie" ? MOVIE_GENRES : TV_GENRES;
    const g = list.find((x) => String(x.id) === String(params.id));
    const kind = params.type === "movie" ? "Movies" : "TV Series";
    const name = g?.name ?? "Genre";
    const title = `${name} ${kind} — Watch Free in HD on PlayFlix`;
    const desc = `Stream the best ${name.toLowerCase()} ${kind.toLowerCase()} free in HD on PlayFlix. Browse trending and top-rated ${name.toLowerCase()} titles.`;
    const url = `https://playflix.ratul.fun/genre/${params.type}/${params.id}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: GenrePage,
});

function GenrePage() {
  const { type, id } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const genres = type === "movie" ? MOVIE_GENRES : TV_GENRES;
  const genre = genres.find((g) => String(g.id) === id);

  const { data } = useQuery({
    queryKey: ["genre", type, id, search.page],
    queryFn: () => tmdbApi.discover({
      type, with_genres: id, sort_by: "popularity.desc", page: search.page,
    }),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          {type === "movie" ? "Movies" : "TV Shows"} · Genre
        </p>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gradient-mono">{genre?.name ?? "Genre"}</h1>
        {data && <p className="text-muted-foreground">{data.total_results.toLocaleString()} titles</p>}
      </header>

      {data && <MediaGrid items={data.results.map((r) => ({ ...r, media_type: type }))} />}

      {data && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={search.page <= 1}
            onClick={() => navigate({ search: { page: search.page - 1 } })}
            className="h-10 px-4 rounded-lg border border-border bg-card hover:bg-white hover:text-black transition disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2 text-sm font-semibold"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="px-4 text-sm font-mono text-muted-foreground">{search.page}</span>
          <button
            disabled={search.page >= Math.min(data.total_pages, 500)}
            onClick={() => navigate({ search: { page: search.page + 1 } })}
            className="h-10 px-4 rounded-lg border border-border bg-card hover:bg-white hover:text-black transition disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2 text-sm font-semibold"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
