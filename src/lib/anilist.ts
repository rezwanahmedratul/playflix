// AniList GraphQL client. Public GraphQL endpoint requires no key for browsing.
const ANILIST_URL = "https://graphql.anilist.co";

export interface AniTitle {
  romaji?: string | null;
  english?: string | null;
  native?: string | null;
}
export interface AniImage {
  large?: string | null;
  extraLarge?: string | null;
  medium?: string | null;
  color?: string | null;
}
export interface AniDate {
  year?: number | null;
  month?: number | null;
  day?: number | null;
}
export interface AniMedia {
  id: number;
  idMal?: number | null;
  title: AniTitle;
  coverImage: AniImage;
  bannerImage?: string | null;
  format?: string | null;
  status?: string | null;
  episodes?: number | null;
  duration?: number | null;
  season?: string | null;
  seasonYear?: number | null;
  startDate?: AniDate;
  endDate?: AniDate;
  averageScore?: number | null;
  meanScore?: number | null;
  popularity?: number | null;
  genres?: string[];
  description?: string | null;
  studios?: { nodes: { id: number; name: string }[] };
  trailer?: { id: string; site: string } | null;
  characters?: {
    edges: {
      role: string;
      node: { id: number; name: { full: string }; image: { large?: string | null } };
      voiceActors?: { id: number; name: { full: string }; image?: { large?: string | null } }[];
    }[];
  };
  recommendations?: {
    nodes: { mediaRecommendation: AniMedia | null }[];
  };
  isAdult?: boolean;
}

export interface Page<T> {
  pageInfo: { total: number; currentPage: number; lastPage: number; hasNextPage: boolean; perPage: number };
  media: T[];
}

const MEDIA_FIELDS = `
  id idMal
  title { romaji english native }
  coverImage { large extraLarge medium color }
  bannerImage
  format status episodes duration season seasonYear
  startDate { year month day }
  averageScore meanScore popularity
  genres
  isAdult
`;

async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`AniList ${res.status}`);
  const json = (await res.json()) as { data: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors.map(e => e.message).join(", "));
  return json.data;
}

function pageQuery(sort: string, extra = "") {
  return `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(type: ANIME, sort: [${sort}], isAdult: false ${extra}) { ${MEDIA_FIELDS} }
      }
    }
  `;
}

export interface AniDiscoverParams {
  page?: number;
  perPage?: number;
  genre?: string;
  tag?: string;
  sort?: string; // POPULARITY_DESC | SCORE_DESC | TRENDING_DESC | START_DATE_DESC | FAVOURITES_DESC
  year?: number;
  minScore?: number; // 0-10 scale
  isAdult?: boolean;
  format?: string;
}

export const anilist = {
  discover: ({ page = 1, perPage = 24, genre, tag, sort = "POPULARITY_DESC", year, minScore, isAdult = false, format }: AniDiscoverParams) =>
    gql<{ Page: Page<AniMedia> }>(
      `query ($page: Int, $perPage: Int, $genre: String, $tag: String, $seasonYear: Int, $averageScore_greater: Int, $isAdult: Boolean, $format: MediaFormat) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { total currentPage lastPage hasNextPage perPage }
          media(
            type: ANIME
            sort: [${sort}]
            genre: $genre
            tag: $tag
            seasonYear: $seasonYear
            averageScore_greater: $averageScore_greater
            isAdult: $isAdult
            format: $format
          ) { ${MEDIA_FIELDS} }
        }
      }`,
      {
        page, perPage,
        genre: genre || undefined,
        tag: tag || undefined,
        seasonYear: year || undefined,
        averageScore_greater: minScore ? Math.round(minScore * 10) - 1 : undefined,
        isAdult: isAdult ? undefined : false,
        format: format || undefined,
      },
    ).then(d => d.Page),

  trending: (page = 1, perPage = 24) =>
    gql<{ Page: Page<AniMedia> }>(pageQuery("TRENDING_DESC, POPULARITY_DESC"), { page, perPage }).then(d => d.Page),
  popular: (page = 1, perPage = 24) =>
    gql<{ Page: Page<AniMedia> }>(pageQuery("POPULARITY_DESC"), { page, perPage }).then(d => d.Page),
  topRated: (page = 1, perPage = 24) =>
    gql<{ Page: Page<AniMedia> }>(pageQuery("SCORE_DESC"), { page, perPage }).then(d => d.Page),
  seasonNow: (page = 1, perPage = 24) => {
    const now = new Date();
    const m = now.getMonth();
    const season = m < 3 ? "WINTER" : m < 6 ? "SPRING" : m < 9 ? "SUMMER" : "FALL";
    return gql<{ Page: Page<AniMedia> }>(
      pageQuery("POPULARITY_DESC", `, season: ${season}, seasonYear: ${now.getFullYear()}`),
      { page, perPage },
    ).then(d => d.Page);
  },
  upcoming: (page = 1, perPage = 24) =>
    gql<{ Page: Page<AniMedia> }>(pageQuery("POPULARITY_DESC", `, status: NOT_YET_RELEASED`), { page, perPage }).then(d => d.Page),
  movies: (page = 1, perPage = 24) =>
    gql<{ Page: Page<AniMedia> }>(pageQuery("POPULARITY_DESC", `, format: MOVIE`), { page, perPage }).then(d => d.Page),
  topMovies: (page = 1, perPage = 24) =>
    gql<{ Page: Page<AniMedia> }>(pageQuery("SCORE_DESC", `, format: MOVIE`), { page, perPage }).then(d => d.Page),
  classics: (page = 1, perPage = 24) =>
    gql<{ Page: Page<AniMedia> }>(pageQuery("SCORE_DESC", `, startDate_lesser: 20060101, format_in: [TV, MOVIE]`), { page, perPage }).then(d => d.Page),
  byGenre: (genre: string, page = 1, perPage = 24) =>
    gql<{ Page: Page<AniMedia> }>(
      `query ($page: Int, $perPage: Int, $genre: String) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { total currentPage lastPage hasNextPage perPage }
          media(type: ANIME, sort: [POPULARITY_DESC], isAdult: false, genre: $genre) { ${MEDIA_FIELDS} }
        }
      }`,
      { page, perPage, genre },
    ).then(d => d.Page),
  search: (search: string, includeAdult = false, page = 1, perPage = 24) =>
    gql<{ Page: Page<AniMedia> }>(
      `query ($page: Int, $perPage: Int, $search: String, $isAdult: Boolean) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { total currentPage lastPage hasNextPage perPage }
          media(type: ANIME, search: $search, isAdult: $isAdult, sort: [SEARCH_MATCH]) { ${MEDIA_FIELDS} }
        }
      }`,
      { page, perPage, search, isAdult: includeAdult ? undefined : false },
    ).then(d => d.Page),
  detail: (id: number) =>
    gql<{ Media: AniMedia }>(
      `query ($id: Int) {
        Media(id: $id, type: ANIME) {
          ${MEDIA_FIELDS}
          description(asHtml: false)
          endDate { year month day }
          studios(isMain: true) { nodes { id name } }
          trailer { id site }
          characters(perPage: 12, sort: [ROLE, RELEVANCE]) {
            edges {
              role
              node { id name { full } image { large } }
              voiceActors(language: JAPANESE) { id name { full } image { large } }
            }
          }
          recommendations(perPage: 12, sort: [RATING_DESC]) {
            nodes { mediaRecommendation { ${MEDIA_FIELDS} } }
          }
        }
      }`,
      { id },
    ).then(d => d.Media),
  genres: () =>
    gql<{ GenreCollection: string[] }>(`query { GenreCollection }`).then(d => d.GenreCollection),
};

// Official AniList genres (used with `genre` filter)
export const genres = [
  "Action", "Adventure", "Comedy", "Drama", "Ecchi", "Fantasy", "Horror",
  "Mahou Shoujo", "Mecha", "Music", "Mystery", "Psychological", "Romance",
  "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller",
];

// AniList tags (used with `tag` filter). Combined with genres this covers
// the common anime discovery vocabulary.
export const tags = [
  "Cars", "Dementia", "Demons", "Game", "Harem", "Historical", "Isekai", "Josei",
  "Kids", "Magic", "Martial Arts", "Military", "Parody", "Police", "Samurai",
  "School", "Seinen", "Shoujo", "Shoujo Ai", "Shounen", "Shounen Ai", "Space",
  "Super Power", "Suspense", "Vampire",
];

// Combined labels for the Discover chip UI. `kind` tells the caller which
// AniList filter param to use.
export interface AnimeGenreOption { name: string; kind: "genre" | "tag" }
export const animeGenreOptions: AnimeGenreOption[] = [
  ...genres.map((name) => ({ name, kind: "genre" as const })),
  ...tags.map((name) => ({ name, kind: "tag" as const })),
].sort((a, b) => a.name.localeCompare(b.name));


export function aniTitle(m: AniMedia): string {
  return m.title.english || m.title.romaji || m.title.native || "Untitled";
}
export function aniYear(m: AniMedia): string {
  return m.seasonYear ? String(m.seasonYear) : m.startDate?.year ? String(m.startDate.year) : "";
}
export function aniPoster(m: AniMedia, size: "medium" | "large" | "extraLarge" = "large"): string {
  return m.coverImage[size] || m.coverImage.large || m.coverImage.medium || "";
}
export function aniScore(m: AniMedia): number {
  return m.averageScore ? m.averageScore / 10 : 0;
}
