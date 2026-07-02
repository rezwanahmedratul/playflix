import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { tmdbApi, MOVIE_GENRES, TV_GENRES } from "@/lib/tmdb";

const BASE_URL = "https://playflix.ratul.fun";

interface SitemapEntry {
  path: string;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/movies", changefreq: "daily", priority: "0.9" },
          { path: "/tv", changefreq: "daily", priority: "0.9" },
          { path: "/anime", changefreq: "daily", priority: "0.9" },
          { path: "/discover", changefreq: "daily", priority: "0.8" },
          { path: "/search", changefreq: "monthly", priority: "0.4" },
        ];

        for (const g of MOVIE_GENRES) {
          entries.push({ path: `/genre/movie/${g.id}`, changefreq: "weekly", priority: "0.7" });
        }
        for (const g of TV_GENRES) {
          entries.push({ path: `/genre/tv/${g.id}`, changefreq: "weekly", priority: "0.7" });
        }

        // Add trending + popular titles as high-signal deep links
        try {
          const [tm, tt, pm, pt, top, ttop] = await Promise.all([
            tmdbApi.trendingMovies().catch(() => ({ results: [] as any[] })),
            tmdbApi.trendingTv().catch(() => ({ results: [] as any[] })),
            tmdbApi.popularMovies().catch(() => ({ results: [] as any[] })),
            tmdbApi.popularTv().catch(() => ({ results: [] as any[] })),
            tmdbApi.topRatedMovies().catch(() => ({ results: [] as any[] })),
            tmdbApi.topRatedTv().catch(() => ({ results: [] as any[] })),
          ]);
          const seen = new Set<string>();
          const push = (t: "movie" | "tv", id: number) => {
            const key = `${t}:${id}`;
            if (seen.has(key)) return;
            seen.add(key);
            entries.push({ path: `/title/${t}/${id}`, changefreq: "weekly", priority: "0.8" });
          };
          for (const r of tm.results) push("movie", r.id);
          for (const r of pm.results) push("movie", r.id);
          for (const r of top.results) push("movie", r.id);
          for (const r of tt.results) push("tv", r.id);
          for (const r of pt.results) push("tv", r.id);
          for (const r of ttop.results) push("tv", r.id);
        } catch {
          // best-effort; core routes always present
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
