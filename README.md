# PlayFlix

A beautiful, modern SaaS-style streaming discovery platform for **movies, TV series, and anime** — with a strict monochrome (black & white) design, cinematic UX, and zero database required. Built with **TanStack Start**, **React 19**, **Tailwind v4**, and powered by public metadata APIs (TMDB + AniList).

> Live: **https://playflix.ratul.fun**

---

## ✨ Features

### Content
- **Movies, TV, Anime** — three unified media types across every surface.
- **TMDB** provides all movie/TV metadata, posters, backdrops, cast, and recommendations.
- **AniList (GraphQL)** provides all anime data — trending, seasonal, top-rated, genres, tags, characters, and voice actors.
- **Multi-provider streaming player** — iframe-based playback via VidAPI, VidSrc, 2Embed (movies/TV) and Videasy, VidSrc.cc, 2Anime (anime), user-switchable per title.

### Browsing & discovery
- **Cinematic Hero** on the home page cycling through 10 featured titles.
- **Home rows**: Trending, Popular, Top Rated, Upcoming, Now Playing, Continue Watching.
- **Dedicated Movies / TV / Anime hubs** with 7–10 curated rows each.
- **Discover page** with unified filtering across Movies, TV, and Anime:
  - Type toggle (Movie / TV / Anime) — genres and sort options swap based on type.
  - Full genre lists (50+ movie/TV categories via TMDB genres + keywords; 40+ anime genres/tags via AniList).
  - Sort, minimum rating, release year, and Adult 18+ toggle.
  - **Infinite scroll** — no pagination, auto-loads as you scroll.
- **Genre browsing** (`/genre/:type/:id`) for any TMDB category.
- **Unified search** across TMDB + AniList in a single query.

### User features (no database, all local)
- **Watchlist** — persisted in `localStorage` via `useSyncExternalStore`.
- **History / Continue Watching** — automatically tracks the last watched season & episode; shown on the home page and on `/history`.
- **Dedicated pages** for Watchlist and History with clear-all / per-item remove.

### UI / UX
- **Monochrome black & white** design system in `src/styles.css` (OKLCH colors, ambient radial gradients, glass panels, hover-lift cards).
- **Persistent left sidebar** navigation (desktop) + responsive mobile menu.
- **PLAY / FLIX** wordmark with a `PlayCircle` icon logo.
- Accessible focus states, keyboard-friendly navigation, hover-revealed controls.

### SEO
See the [SEO section](#-seo) below.

---

## 🏗 Tech Stack

| Layer         | Choice                                                             |
| ------------- | ------------------------------------------------------------------ |
| Framework     | TanStack Start v1 (SSR + file-based routing) on Vite 7             |
| UI            | React 19, Tailwind CSS v4, shadcn/ui primitives, Lucide icons      |
| Data fetching | TanStack Query with loaders (`ensureQueryData` + `useSuspenseQuery`) |
| APIs          | TMDB REST v3, AniList GraphQL v2                                    |
| State         | `localStorage` + `useSyncExternalStore` (watchlist, history)        |
| Deployment    | Nitro presets: Cloudflare Workers/Pages, Vercel, Netlify, Node (Render), Lovable |

No database. No auth service. All personalization is browser-local.

---

## 📁 Project structure

```
src/
├── routes/
│   ├── __root.tsx            # Sitewide head, JSON-LD, layout
│   ├── index.tsx             # Home: hero + rows + continue watching
│   ├── movies.tsx            # Movies hub
│   ├── tv.tsx                # TV hub
│   ├── anime.tsx             # Anime hub (AniList)
│   ├── discover.tsx          # Unified filter + infinite scroll
│   ├── genre.$type.$id.tsx   # Browse by genre
│   ├── search.tsx            # Multi-source search
│   ├── title.$type.$id.tsx   # Movie/TV details page
│   ├── watch.$type.$id.tsx   # Movie/TV player
│   ├── anime_.$id.tsx        # Anime details page
│   ├── anime-watch.$id.tsx   # Anime player
│   ├── watchlist.tsx
│   ├── history.tsx
│   └── sitemap[.]xml.ts      # Dynamic sitemap server route
├── components/
│   ├── AppSidebar.tsx        # Left navigation + branding
│   ├── Hero.tsx              # Featured content carousel
│   ├── MediaRow.tsx          # Horizontal scroller w/ overlay arrows
│   ├── MediaCard.tsx / MediaGrid.tsx
│   ├── AnimeRow.tsx / AnimeCard.tsx
│   ├── ContinueWatchingRow.tsx / ContinueWatchingCard.tsx
│   └── StreamingPlayer.tsx   # Multi-provider iframe player
├── lib/
│   ├── tmdb.ts               # TMDB client + curated queries
│   ├── anilist.ts            # AniList GraphQL client
│   ├── providers.ts          # Movie/TV streaming providers
│   ├── animeProviders.ts     # Anime streaming providers
│   ├── watchlist.ts          # localStorage watchlist
│   └── history.ts            # localStorage watch history
└── styles.css                # Tailwind v4 tokens + monochrome theme
```

---

## 🚀 Running locally

```bash
bun install
bun run dev          # http://localhost:8080
bun run build        # production build (Nitro cloudflare-module by default)
bun run preview      # preview the production build
```

No environment variables are required to run — TMDB & AniList are called from the browser using the public tokens embedded in `src/lib/tmdb.ts` / `src/lib/anilist.ts`.

---

## 🌍 Deployment

PlayFlix is portable and deploys everywhere. See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for step-by-step guides.

| Platform         | Preset (`NITRO_PRESET`) | Config file        |
| ---------------- | ----------------------- | ------------------ |
| Lovable          | `cloudflare-module`     | *(default)*        |
| Cloudflare Pages | `cloudflare-pages`      | `wrangler.toml`    |
| Vercel           | `vercel`                | `vercel.json`      |
| Netlify          | `netlify`               | `netlify.toml`     |
| Render (Node)    | `node-server`           | `render.yaml`      |

---

## 🔎 SEO

PlayFlix is engineered to rank when users search for individual movies, series, or anime titles.

### Site-wide (in `src/routes/__root.tsx`)
- Real title / description (no template defaults).
- `viewport`, `charSet`, `og:type=website`, `og:site_name=PlayFlix`, `twitter:card=summary_large_image`.
- **JSON-LD**: `Organization` + `WebSite` (with `SearchAction` pointing to `/search?q={query}`).

### Per-route metadata
Every user-facing route sets its own head via `head()`:

- **`/title/:type/:id`** — dynamic loader prefetches TMDB data and emits:
  - `Watch {Title} ({Year}) Online Free in HD — PlayFlix` as title.
  - Full plot as description.
  - Dynamic `og:image` using TMDB backdrops (original resolution).
  - JSON-LD `Movie` or `TVSeries` schema with cast, director, rating, and release date.
  - Self-referencing canonical + `og:url`.
- **`/anime/:id`** — AniList metadata + JSON-LD `TVSeries` schema, banner image as `og:image`.
- **`/discover`, `/movies`, `/tv`, `/anime`, `/search`, `/genre/*`** — unique titles and descriptions per hub.
- **`/watch/*`, `/anime-watch/*`, `/watchlist`, `/history`** — `noindex` to avoid duplicate-content dilution, with canonical pointing back to the corresponding `/title` or `/anime` details page.

### Crawlability
- **`public/robots.txt`** — allows all crawlers, disallows `/watch/` and `/watchlist` (private/duplicate surfaces), advertises the sitemap.
- **`src/routes/sitemap[.]xml.ts`** — dynamic `/sitemap.xml` server route that includes:
  - Static hubs (`/`, `/movies`, `/tv`, `/anime`, `/discover`, `/search`).
  - Every TMDB genre page (movie + TV).
  - Trending / popular titles fetched from TMDB and AniList at request time.
  - Correct `<lastmod>`, `<changefreq>`, and `<priority>` values.

### Performance signals
- Server-rendered routes with SWR-style loaders → fast **LCP** and shareable deep links.
- Poster & backdrop images use TMDB's CDN with responsive sizes.
- Semantic HTML: single `H1` per page, alt text on images, keyboard-focus rings, `lang="en"` on `<html>`.

### Domain
Canonical + `og:url` + sitemap use **`https://playflix.ratul.fun`**. Update these strings if the domain changes.

### Rescanning
Trigger a fresh SEO scan from the **SEO & AI search** tab in Lovable. Search-console indexing usually takes 1–7 days after publish; you can force re-fetch a specific URL via Google Search Console → URL Inspection → *Request Indexing*.

---

## 🙌 Credits

- Metadata: [TMDB](https://www.themoviedb.org) & [AniList](https://anilist.co).
- Streaming providers: VidAPI, VidSrc, 2Embed, Videasy, 2Anime.
- Built by **Rezwan Ahmed Ratul** with love ♥ on Lovable.

## ⚖️ Legal

PlayFlix is a metadata & discovery front-end. It does not host any video content. All streams are embedded from third-party providers who are solely responsible for their content. Verify that use of those providers is legal in your jurisdiction.
