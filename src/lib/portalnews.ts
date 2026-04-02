import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import type { PortalNewsCategory, PortalNewsItem } from "@/lib/portalnews-shared";
export type { PortalNewsCategory, PortalNewsItem } from "@/lib/portalnews-shared";

export type PortalNewsSource = "newsmaker" | "legacy";

type FetchJsonResult = {
  ok: boolean;
  status: number;
  payload: unknown;
};

const PRIMARY_NEWS_LIST_URL =
  process.env.PORTALNEWS_NEWS_LIST_URL ??
  process.env.PORTALNEWS_API_URL ??
  process.env.NEXT_PUBLIC_PORTALNEWS_API_URL ??
  "";

const derivedNewsmakerBaseUrl = PRIMARY_NEWS_LIST_URL
  ? PRIMARY_NEWS_LIST_URL.replace(
      /\/api\/v1\/berita(?:\/.*)?$/i,
      "/api/v1/newsmaker",
    )
  : "";

const NEWSMAKER_BASE_URL =
  process.env.PORTALNEWS_NEWSMAKER_BASE_URL ??
  derivedNewsmakerBaseUrl;

const NEWS_CATEGORIES_URL =
  process.env.PORTALNEWS_NEWS_CATEGORIES_URL ??
  (NEWSMAKER_BASE_URL ? `${NEWSMAKER_BASE_URL}/kategori` : "");

const FALLBACK_NEWS_LIST_URL =
  process.env.PORTALNEWS_API_URL ??
  process.env.NEXT_PUBLIC_PORTALNEWS_API_URL ??
  (NEWSMAKER_BASE_URL ? `${NEWSMAKER_BASE_URL}/berita` : "");

const FALLBACK_NEWS_DETAIL_URL =
  process.env.PORTALNEWS_NEWS_DETAIL_URL ??
  (NEWSMAKER_BASE_URL ? `${NEWSMAKER_BASE_URL}/berita` : "");

const FALLBACK_NEWS_SHOW_URL =
  process.env.PORTALNEWS_NEWS_SHOW_URL ??
  (NEWSMAKER_BASE_URL ? `${NEWSMAKER_BASE_URL}/berita/show` : "");

const PRIMARY_NEWS_DETAIL_URL =
  process.env.PORTALNEWS_NEWS_DETAIL_URL ?? PRIMARY_NEWS_LIST_URL;

const NEWS_TOKEN =
  process.env.PORTALNEWS_TOKEN ??
  process.env.NEXT_PUBLIC_PORTALNEWS_TOKEN ??
  "";

export const PORTALNEWS_IMAGE_BASE = (
  process.env.PORTALNEWS_IMAGE_BASE ??
  process.env.NEXT_PUBLIC_PORTALNEWS_IMAGE_BASE ??
  ""
).replace(/\/$/, "");

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isNonNullable = <T>(value: T | null | undefined): value is T =>
  value != null;

const cleanTextForLocaleGuess = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const countPatternMatches = (value: string, patterns: RegExp[]) =>
  patterns.reduce((total, pattern) => {
    const matches = value.match(pattern);
    return total + (matches?.length ?? 0);
  }, 0);

const INDONESIAN_PATTERNS = [
  /\b(yang|dan|dengan|untuk|dari|pada|setelah|sebelum|harga|turun|naik)\b/g,
  /\b(jika|beli|jual|artikel|analisis|rilis|berada|didukung|konflik)\b/g,
  /\b(kawasan|personel|militer|tekanan|risiko|terhadap|keputusan)\b/g,
];

const ENGLISH_PATTERNS = [
  /\b(the|and|with|from|after|before|price|fell|rose|article|analysis)\b/g,
  /\b(buy|sell|market|gold|this|release|region|conflict|military)\b/g,
  /\b(support|resistance|pressure|risk|decision|personnel|weekly)\b/g,
];

const detectLikelyLocale = (value?: string | null) => {
  if (!value) return "unknown";

  const cleanedValue = cleanTextForLocaleGuess(value);
  if (!cleanedValue) return "unknown";

  const idScore = countPatternMatches(cleanedValue, INDONESIAN_PATTERNS);
  const enScore = countPatternMatches(cleanedValue, ENGLISH_PATTERNS);

  if (idScore >= enScore + 2) return "id";
  if (enScore >= idScore + 2) return "en";
  return "unknown";
};

const normalizeLocalizedPair = (idValue?: string, enValue?: string) => {
  const idLocale = detectLikelyLocale(idValue);
  const enLocale = detectLikelyLocale(enValue);

  if (idValue && enValue && idLocale === "en" && enLocale === "id") {
    return {
      id: enValue,
      en: idValue,
    };
  }

  return {
    id: idValue,
    en: enValue,
  };
};

const getRequestHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (NEWS_TOKEN) {
    headers.Authorization = `Bearer ${NEWS_TOKEN}`;
  }

  return headers;
};

const fetchJson = async (url: string): Promise<FetchJsonResult> => {
  if (!url) {
    return { ok: false, status: 0, payload: null };
  }

  try {
    const response = await fetchWithTimeout(url, {
      headers: getRequestHeaders(),
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null);

    return {
      ok: response.ok,
      status: response.status,
      payload,
    };
  } catch {
    return { ok: false, status: 0, payload: null };
  }
};

const normalizeCategoryRecord = (
  value: unknown,
): PortalNewsCategory | null => {
  if (!isRecord(value)) {
    return null;
  }

  return {
    id: typeof value.id === "number" ? value.id : undefined,
    name: typeof value.name === "string" ? value.name : undefined,
    slug: typeof value.slug === "string" ? value.slug : undefined,
    articles_count:
      typeof value.articles_count === "number" ? value.articles_count : undefined,
  };
};

const normalizeItemRecord = (value: unknown): PortalNewsItem | null => {
  if (!isRecord(value)) {
    return null;
  }

  const category = normalizeCategoryRecord(value.kategori);
  const subCategory = normalizeCategoryRecord(value.sub_category);
  const mainCategory = normalizeCategoryRecord(value.main_category);
  const primaryCategory = category ?? subCategory ?? mainCategory;

  const titlesRecord = isRecord(value.titles) ? value.titles : null;
  const contentsRecord = isRecord(value.contents) ? value.contents : null;

  const titleDefault =
    typeof value.title === "string"
      ? value.title
      : titlesRecord && typeof titlesRecord.default === "string"
        ? titlesRecord.default
        : undefined;
  const rawTitleId =
    typeof value.title_id === "string"
      ? value.title_id
      : titlesRecord && typeof titlesRecord.id === "string"
        ? titlesRecord.id
        : !titleDefault && typeof value.title === "string"
          ? value.title
          : undefined;
  const rawTitleEn =
    typeof value.title_en === "string"
      ? value.title_en
      : titlesRecord && typeof titlesRecord.en === "string"
        ? titlesRecord.en
        : !titleDefault && typeof value.title === "string"
          ? value.title
          : undefined;
  const { id: titleId, en: titleEn } = normalizeLocalizedPair(
    rawTitleId,
    rawTitleEn,
  );
  const title = titleDefault ?? titleId ?? titleEn;

  const contentDefault =
    typeof value.content === "string"
      ? value.content
      : contentsRecord && typeof contentsRecord.default === "string"
        ? contentsRecord.default
        : undefined;
  const rawContentId =
    typeof value.content_id === "string"
      ? value.content_id
      : contentsRecord && typeof contentsRecord.id === "string"
        ? contentsRecord.id
        : !contentDefault && typeof value.content === "string"
          ? value.content
          : undefined;
  const rawContentEn =
    typeof value.content_en === "string"
      ? value.content_en
      : contentsRecord && typeof contentsRecord.en === "string"
        ? contentsRecord.en
        : !contentDefault && typeof value.content === "string"
          ? value.content
          : undefined;
  const { id: contentId, en: contentEn } = normalizeLocalizedPair(
    rawContentId,
    rawContentEn,
  );
  const content = contentDefault ?? contentId ?? contentEn;

  const rawImages = Array.isArray(value.images)
    ? value.images.filter(
        (image): image is string => typeof image === "string" && image.length > 0,
      )
    : [];

  const imageUrl =
    typeof value.image_url === "string" && value.image_url
      ? value.image_url
      : typeof value.image === "string" && value.image
        ? value.image
        : undefined;

  return {
    id: typeof value.id === "number" ? value.id : undefined,
    title,
    titles: title
      ? {
          default: title,
          id: titleId ?? title ?? titleEn,
          en: titleEn ?? title ?? titleId,
        }
      : undefined,
    slug: typeof value.slug === "string" ? value.slug : undefined,
    content,
    contents: content
      ? {
          default: content,
          id: contentId ?? content ?? contentEn,
          en: contentEn ?? content ?? contentId,
        }
      : undefined,
    category_id:
      typeof value.category_id === "number"
        ? value.category_id
        : typeof value.sub_category_id === "number"
          ? value.sub_category_id
          : typeof value.main_category_id === "number"
            ? value.main_category_id
            : primaryCategory?.id,
    kategori: primaryCategory ?? undefined,
    main_category: mainCategory ?? undefined,
    sub_category: subCategory ?? undefined,
    images: rawImages.length > 0 ? rawImages : imageUrl ? [imageUrl] : [],
    source: typeof value.source === "string" ? value.source : undefined,
    author: typeof value.author === "string" ? value.author : undefined,
    created_at: typeof value.created_at === "string" ? value.created_at : undefined,
    updated_at: typeof value.updated_at === "string" ? value.updated_at : undefined,
  };
};

const normalizePayloadArray = <T>(
  payload: unknown,
  guard: (value: unknown) => value is T,
) => {
  if (Array.isArray(payload)) {
    return payload.filter(guard);
  }

  if (!isRecord(payload)) {
    return [] as T[];
  }

  const candidates = [
    payload.data,
    payload.results,
    payload.items,
    payload.categories,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter(guard);
    }
  }

  return [] as T[];
};

const extractItemArray = (payload: unknown) => {
  if (Array.isArray(payload)) {
    return payload.map(normalizeItemRecord).filter(isNonNullable);
  }

  if (!isRecord(payload)) {
    return [] as PortalNewsItem[];
  }

  const candidates = [payload.data, payload.results, payload.items];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.map(normalizeItemRecord).filter(isNonNullable);
    }
  }

  return [] as PortalNewsItem[];
};

const normalizePayloadItem = (payload: unknown): PortalNewsItem | null => {
  if (Array.isArray(payload)) {
    const [first] = payload.map(normalizeItemRecord).filter(isNonNullable);
    return first ?? null;
  }

  if (!isRecord(payload)) {
    return null;
  }

  const directCandidateKeys = ["data", "result", "item", "article"];

  for (const key of directCandidateKeys) {
    const candidate = payload[key];
    const normalizedCandidate = normalizeItemRecord(candidate);
    if (normalizedCandidate) {
      return normalizedCandidate;
    }
    if (Array.isArray(candidate)) {
      const [first] = candidate
        .map(normalizeItemRecord)
        .filter(isNonNullable);
      if (first) {
        return first;
      }
    }
  }

  return normalizeItemRecord(payload);
};

const deriveCategoriesFromItems = (items: PortalNewsItem[]) => {
  const categoryMap = new Map<string, PortalNewsCategory>();

  items.forEach((item) => {
    const category = item.kategori;
    if (!category) return;

    const key = [
      category.id ?? "",
      category.slug ?? "",
      category.name ?? "",
    ].join("|");

    if (!categoryMap.has(key)) {
      categoryMap.set(key, category);
    }
  });

  return Array.from(categoryMap.values()).sort((a, b) =>
    (a.name ?? "").localeCompare(b.name ?? ""),
  );
};

export const normalizePortalNewsCategory = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const getPortalNewsPrimaryCategory = (
  item: Pick<PortalNewsItem, "kategori" | "main_category" | "sub_category">,
) => item.kategori ?? item.sub_category ?? item.main_category ?? undefined;

export const getPortalNewsCategorySlug = (
  item: Pick<PortalNewsItem, "kategori" | "main_category" | "sub_category">,
  fallback = "",
) => getPortalNewsPrimaryCategory(item)?.slug?.trim() || fallback;

export const getPortalNewsMainCategorySlug = (
  item: Pick<PortalNewsItem, "main_category">,
  fallback = "",
) => item.main_category?.slug?.trim() || fallback;

export const getPortalNewsCategoryName = (
  item: Pick<PortalNewsItem, "kategori" | "main_category" | "sub_category">,
  fallback = "",
) => getPortalNewsPrimaryCategory(item)?.name?.trim() || fallback;

export const getPortalNewsCategoryKeys = (
  item: Pick<PortalNewsItem, "kategori" | "main_category" | "sub_category">,
) =>
  [item.kategori, item.sub_category, item.main_category]
    .flatMap((category) => [
      normalizePortalNewsCategory(category?.slug),
      normalizePortalNewsCategory(category?.name),
    ])
    .filter(Boolean) as string[];

export const getPortalNewsItemTimestamp = (item: PortalNewsItem) => {
  const value = item.updated_at ?? item.created_at;
  if (!value) return 0;

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export const sortPortalNewsItemsByDate = (items: PortalNewsItem[]) =>
  [...items].sort(
    (left, right) =>
      getPortalNewsItemTimestamp(right) - getPortalNewsItemTimestamp(left),
  );

export const buildPortalNewsImageUrl = (imagePath?: string | null) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;

  const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return PORTALNEWS_IMAGE_BASE
    ? `${PORTALNEWS_IMAGE_BASE}${normalizedPath}`
    : normalizedPath;
};

export async function fetchPortalNewsList(): Promise<{
  items: PortalNewsItem[];
  source: PortalNewsSource;
}> {
  const primaryResult = await fetchJson(PRIMARY_NEWS_LIST_URL);
  const primaryItems = extractItemArray(primaryResult.payload);

  if (primaryResult.ok && primaryItems.length > 0) {
    return {
      items: primaryItems,
      source: "legacy",
    };
  }

  const fallbackResult = await fetchJson(FALLBACK_NEWS_LIST_URL);
  const fallbackItems = extractItemArray(fallbackResult.payload);

  if (fallbackResult.ok && fallbackItems.length > 0) {
    return {
      items: fallbackItems,
      source: "newsmaker",
    };
  }

  return {
    items: primaryItems.length > 0 ? primaryItems : fallbackItems,
    source: primaryItems.length > 0 ? "legacy" : "newsmaker",
  };
}

export async function fetchPortalNewsCategories(): Promise<{
  categories: PortalNewsCategory[];
  source: PortalNewsSource;
}> {
  const newsmakerResult = await fetchJson(NEWS_CATEGORIES_URL);
  const newsmakerCategories = normalizePayloadArray(
    newsmakerResult.payload,
    (value): value is PortalNewsCategory =>
      normalizeCategoryRecord(value) !== null,
  );

  if (newsmakerResult.ok && Array.isArray(newsmakerCategories)) {
    return {
      categories: newsmakerCategories
        .map(normalizeCategoryRecord)
        .filter(isNonNullable),
      source: "newsmaker",
    };
  }

  const { items, source } = await fetchPortalNewsList();
  return {
    categories: deriveCategoriesFromItems(items),
    source,
  };
}

export async function fetchPortalNewsArticle(slug: string): Promise<{
  item: PortalNewsItem | null;
  source: PortalNewsSource;
}> {
  const normalizedSlug = slug.trim();
  const detailRequests = [
    {
      url: PRIMARY_NEWS_DETAIL_URL
        ? `${PRIMARY_NEWS_DETAIL_URL}/${normalizedSlug}`
        : "",
      source: "legacy" as const,
    },
    {
      url: FALLBACK_NEWS_SHOW_URL
        ? `${FALLBACK_NEWS_SHOW_URL}/${normalizedSlug}`
        : "",
      source: "newsmaker" as const,
    },
    {
      url: FALLBACK_NEWS_DETAIL_URL
        ? `${FALLBACK_NEWS_DETAIL_URL}/${normalizedSlug}`
        : "",
      source: "newsmaker" as const,
    },
  ].filter((request) => Boolean(request.url));

  for (const request of detailRequests) {
    const result = await fetchJson(request.url);
    const item = normalizePayloadItem(result.payload);

    if (result.ok && item) {
      return {
        item,
        source: request.source,
      };
    }
  }

  const { items, source } = await fetchPortalNewsList();

  return {
    item: items.find((item) => item.slug === normalizedSlug) ?? null,
    source,
  };
}
