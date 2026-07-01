import { useEffect, useState, useSyncExternalStore } from "react";
import type { MediaItem, MediaType } from "./tmdb";

const KEY = "playflix:watchlist:v1";

export interface WatchlistEntry {
  id: number;
  type: MediaType;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  year: string | number;
  addedAt: number;
}

type Listener = () => void;
const listeners = new Set<Listener>();
let cache: WatchlistEntry[] | null = null;

function read(): WatchlistEntry[] {
  if (cache) return cache;
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as WatchlistEntry[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: WatchlistEntry[]) {
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

export const watchlist = {
  getAll(): WatchlistEntry[] {
    return read();
  },
  has(id: number, type: MediaType) {
    return read().some((e) => e.id === id && e.type === type);
  },
  add(entry: WatchlistEntry) {
    const cur = read();
    if (cur.some((e) => e.id === entry.id && e.type === entry.type)) return;
    write([{ ...entry, addedAt: Date.now() }, ...cur]);
  },
  remove(id: number, type: MediaType) {
    write(read().filter((e) => !(e.id === id && e.type === type)));
  },
  toggle(entry: WatchlistEntry) {
    if (this.has(entry.id, entry.type)) this.remove(entry.id, entry.type);
    else this.add(entry);
  },
  subscribe(l: Listener): () => void {
    listeners.add(l);
    return () => { listeners.delete(l); };
  },
};

export function useWatchlist() {
  return useSyncExternalStore(
    (cb) => watchlist.subscribe(cb),
    () => watchlist.getAll(),
    () => [],
  );
}

export function useIsInWatchlist(id: number, type: MediaType) {
  const [v, setV] = useState(false);
  useEffect(() => {
    setV(watchlist.has(id, type));
    const unsub = watchlist.subscribe(() => setV(watchlist.has(id, type)));
    return () => { unsub(); };
  }, [id, type]);
  return v;
}

export function entryFromMedia(m: MediaItem, type: MediaType): WatchlistEntry {
  const d = m.release_date || m.first_air_date || "";
  return {
    id: m.id,
    type,
    title: m.title || m.name || "Untitled",
    poster_path: m.poster_path,
    backdrop_path: m.backdrop_path,
    vote_average: m.vote_average,
    year: d ? new Date(d).getFullYear() : "",
    addedAt: 0,
  };
}
