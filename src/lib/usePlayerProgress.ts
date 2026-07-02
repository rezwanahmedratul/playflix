/**
 * Listens to iframe playback progress emitted via window.postMessage by
 * providers that support it (vidlink.pro, videasy, some vidsrc variants).
 *
 * Handles both message shapes we've seen:
 *   1) { type: 'MEDIA_DATA', data: { [tmdbId]: { id, type, progress:{watched,duration}, last_season_watched, last_episode_watched } } }
 *   2) { type: 'PLAYER_EVENT', data: { event, currentTime, duration, tmdbId, mediaType, season, episode } }
 *   3) videasy anime: { type: 'MEDIA_DATA', data: { [anilistId]: { progress: {watched, duration}, last_episode_watched } } }
 *
 * The listener writes into our history store; the store debounces small deltas.
 */
import { useEffect } from "react";
import { history, type HistoryKind } from "./history";

interface Args {
  kind: HistoryKind;
  id: string | number;
  /** For TV shows, the currently selected season. */
  season?: number;
  /** Currently selected episode (TV / anime). */
  episode?: number;
  /** Called when provider reports a new "current" season/episode (advance). */
  onEpisodeChange?: (season: number | undefined, episode: number) => void;
}

export function usePlayerProgress({ kind, id, season, episode, onEpisodeChange }: Args) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const idStr = String(id);

    const onMessage = (ev: MessageEvent) => {
      const raw = ev.data;
      if (!raw || typeof raw !== "object") return;
      const type = (raw as { type?: string }).type;
      const data = (raw as { data?: unknown }).data;
      if (!type || !data) return;

      try {
        if (type === "MEDIA_DATA") {
          // Shape: { [id]: { progress:{watched,duration}, last_season_watched, last_episode_watched } }
          const entries = Object.entries(data as Record<string, unknown>);
          for (const [mediaId, val] of entries) {
            if (String(mediaId) !== idStr) continue;
            const v = val as {
              progress?: { watched?: number; duration?: number };
              last_season_watched?: number | string;
              last_episode_watched?: number | string;
              show_progress?: Record<string, { progress?: { watched?: number; duration?: number } }>;
            };
            const s =
              v.last_season_watched !== undefined ? Number(v.last_season_watched) : season;
            const e =
              v.last_episode_watched !== undefined ? Number(v.last_episode_watched) : episode;

            // Prefer the per-episode progress for TV/anime, else the top-level movie progress.
            let watched = v.progress?.watched;
            let duration = v.progress?.duration;
            if (v.show_progress && kind !== "movie" && s !== undefined && e !== undefined) {
              const key = `s${s}e${e}`;
              const ep = v.show_progress[key];
              if (ep?.progress) {
                watched = ep.progress.watched ?? watched;
                duration = ep.progress.duration ?? duration;
              }
            }

            if (typeof watched === "number" && typeof duration === "number" && duration > 0) {
              history.updateProgress(
                kind,
                id,
                { watched, duration },
                { season: kind === "tv" ? s : undefined, episode: kind === "movie" ? undefined : e },
              );
            }
            if (
              onEpisodeChange &&
              e !== undefined &&
              (e !== episode || (kind === "tv" && s !== season))
            ) {
              onEpisodeChange(kind === "tv" ? s : undefined, e);
            }
          }
          return;
        }

        if (type === "PLAYER_EVENT") {
          const v = data as {
            event?: string;
            currentTime?: number;
            duration?: number;
            tmdbId?: number | string;
            id?: number | string;
            season?: number;
            episode?: number;
          };
          const evId = v.tmdbId ?? v.id;
          if (evId !== undefined && String(evId) !== idStr) return;
          if (typeof v.currentTime !== "number" || typeof v.duration !== "number" || v.duration <= 0) return;
          history.updateProgress(
            kind,
            id,
            { watched: v.currentTime, duration: v.duration },
            {
              season: kind === "tv" ? v.season ?? season : undefined,
              episode: kind === "movie" ? undefined : v.episode ?? episode,
            },
          );
          if (v.event === "ended") {
            history.markWatched(kind, id, true);
          }
          return;
        }
      } catch {
        // Ignore malformed messages — third-party providers vary.
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [kind, id, season, episode, onEpisodeChange]);
}
