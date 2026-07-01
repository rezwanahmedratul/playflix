# Deploying PlayFlix

PlayFlix is a TanStack Start app built with Nitro, so it can be deployed to any modern JavaScript host by changing the **Nitro preset** at build time. There is no database — all data comes from public APIs (TMDB, AniList) and `localStorage` — so every target below is fully supported.

## Quick reference

| Platform         | Preset (`NITRO_PRESET`) | Build command                    | Output directory                 |
| ---------------- | ----------------------- | -------------------------------- | -------------------------------- |
| Lovable (default)| `cloudflare-module`     | `bun run build`                  | `.output/`                       |
| Cloudflare Pages | `cloudflare-pages`      | `NITRO_PRESET=cloudflare-pages bun run build` | `dist/`                 |
| Vercel           | `vercel`                | `NITRO_PRESET=vercel bun run build`           | `.vercel/output/`       |
| Netlify          | `netlify`               | `NITRO_PRESET=netlify bun run build`          | `.netlify/`             |
| Render / Node    | `node-server`           | `NITRO_PRESET=node-server bun run build`      | `.output/` (`node .output/server/index.mjs`) |

---

## Cloudflare Pages

1. Push the repo to GitHub.
2. In Cloudflare Pages → Create project → connect the repo.
3. Framework preset: **None**.
4. Build command: `NITRO_PRESET=cloudflare-pages bun run build`
5. Build output directory: `dist`
6. Add compatibility flag: `nodejs_compat` (Settings → Functions → Compatibility flags).

The included `wrangler.toml` documents this.

## Vercel

1. Import the repo in Vercel.
2. Framework preset: **Other**.
3. Build command: `NITRO_PRESET=vercel bun run build`
4. Output directory: `.vercel/output` (auto-detected).
5. Install command: `bun install` (or leave default `npm install`).

`vercel.json` in the repo pins these values.

## Netlify

1. New site from Git.
2. Build command: `NITRO_PRESET=netlify bun run build`
3. Publish directory: `dist`
4. `netlify.toml` in the repo sets this up automatically.

## Render (Node service)

1. New → Web Service → connect repo.
2. Runtime: **Node**.
3. Build command: `bun install && NITRO_PRESET=node-server bun run build`
4. Start command: `node .output/server/index.mjs`
5. `render.yaml` in the repo is a ready-to-use blueprint (New → Blueprint).

## Lovable

Just click **Publish** in the editor. Uses `cloudflare-module` by default.

---

## Environment variables

None are required — TMDB & AniList are called from the browser with public tokens embedded in `src/lib/tmdb.ts` / `anilist.ts`. If you later move to server-only fetching, set them on each platform's dashboard (they load automatically from `process.env` on the server, `import.meta.env.VITE_*` on the client).

## Notes

- The `/sitemap.xml` route is a server route; it works on every preset above.
- Client-only data (watchlist, history) lives in `localStorage`, so it persists per-browser regardless of host.
- SPA fallback / deep-link 404s are handled by Nitro on every preset — no extra `_redirects` file needed.
