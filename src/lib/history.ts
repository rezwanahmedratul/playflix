import { useSyncExternalStore } from "react";

const KEY = "playflix:history:v1";
const MAX_ENTRIES = 60;

export type HistoryKind = "movie" | "tv" | "anime";

export interface Progress {
  watched: number; // seconds watched (current position)
  duration: number; // total seconds
}

export interface HistoryEntry {
  kind: HistoryKind;
  id: number | string;
  title: string;
  poster_path?: string | null; // TMDB relative path
  posterUrl?: string | null; // Absolute (for AniList)
  backdrop_path?: string | null;
  bannerUrl?: string | null;
  year?: string | number;
  vote_average?: number;
  season?: number;
  episode?: number;
  totalEpisodes?: number;
  progress?: Progress;
  /** true when watched >= WATCHED_THRESHOLD of duration */
  watched?: boolean;
  updatedAt: number;
}

/** Playback is considered "watched/finished" at or above this fraction. */
export const WATCHED_THRESHOLD = 0.9;

type Listener = () => void;
const listeners = new Set<Listener>();
let cache: HistoryEntry[] | null = null;

function read(): HistoryEntry[] {
  if (cache) return cache;
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: HistoryEntry[]) {
  cache = next.slice(0, MAX_ENTRIES);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  }
  listeners.forEach((l) => l());
}

function keyOf(kind: HistoryKind, id: number | string) {
  return `${kind}:${id}`;
}

export function progressPercent(e: HistoryEntry): number {
  const p = e.progress;
  if (!p || !p.duration) return 0;
  return Math.max(0, Math.min(1, p.watched / p.duration));
}

export const history = {
  getAll(): HistoryEntry[] {
    return read();
  },
  get(kind: HistoryKind, id: number | string): HistoryEntry | undefined {
    const k = keyOf(kind, id);
    return read().find((e) => keyOf(e.kind, e.id) === k);
  },
  upsert(entry: Omit<HistoryEntry, "updatedAt"> & { updatedAt?: number }) {
    const cur = read();
    const k = keyOf(entry.kind, entry.id);
    const existing = cur.find((e) => keyOf(e.kind, e.id) === k);
    const filtered = cur.filter((e) => keyOf(e.kind, e.id) !== k);
    const merged: HistoryEntry = {
      ...(existing ?? {}),
      ...entry,
      updatedAt: Date.now(),
    } as HistoryEntry;
    write([merged, ...filtered]);
  },
  /** Update playback progress; auto-flips watched when >= 90%. Debounced upstream. */
  updateProgress(
    kind: HistoryKind,
    id: number | string,
    progress: Progress,
    extras?: Partial<Pick<HistoryEntry, "season" | "episode">>,
  ) {
    const cur = read();
    const k = keyOf(kind, id);
    const existing = cur.find((e) => keyOf(e.kind, e.id) === k);
    if (!existing) return; // wait until upsert has run
    const pct = progress.duration > 0 ? progress.watched / progress.duration : 0;
    const nextWatched = existing.watched || pct >= WATCHED_THRESHOLD;
    const merged: HistoryEntry = {
      ...existing,
      ...(extras ?? {}),
      progress,
      watched: nextWatched,
      updatedAt: Date.now(),
    };
    // Avoid writing on tiny deltas (< 3s) to reduce churn.
    if (
      existing.progress &&
      Math.abs(existing.progress.watched - progress.watched) < 3 &&
      existing.progress.duration === progress.duration &&
      existing.watched === nextWatched &&
      existing.season === merged.season &&
      existing.episode === merged.episode
    ) {
      return;
    }
    const filtered = cur.filter((e) => keyOf(e.kind, e.id) !== k);
    write([merged, ...filtered]);
  },
  markWatched(kind: HistoryKind, id: number | string, watched = true) {
    const cur = read();
    const k = keyOf(kind, id);
    const existing = cur.find((e) => keyOf(e.kind, e.id) === k);
    if (!existing) return;
    const filtered = cur.filter((e) => keyOf(e.kind, e.id) !== k);
    write([{ ...existing, watched, updatedAt: Date.now() }, ...filtered]);
  },
  remove(kind: HistoryKind, id: number | string) {
    write(read().filter((e) => !(e.kind === kind && String(e.id) === String(id))));
  },
  clear() {
    write([]);
  },
  subscribe(l: Listener): () => void {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

export function useHistory() {
  return useSyncExternalStore(
    (cb) => history.subscribe(cb),
    () => history.getAll(),
    () => [],
  );
}
