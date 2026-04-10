import {
  fetchPortalNewsArticle,
  getPortalNewsCategoryKeys,
  getPortalNewsCategorySlug,
  getPortalNewsItemTimestamp,
  fetchPortalNewsList,
  fetchPasarIndonesiaNews,
  fetchPasarIndonesiaAnalysis,
  normalizePortalNewsCategory,
  PORTALNEWS_IMAGE_BASE,
  sortPortalNewsItemsByDate,
  type PortalNewsItem,
  type PortalNewsSource,
} from "@/lib/portalnews";
import {
  resolvePortalNewsContent,
  resolvePortalNewsTitle,
} from "@/lib/portalnews-shared";
import {
  INDONESIA_MARKET_ANALYSIS_CATEGORY_SLUG,
  INDONESIA_MARKET_NEWS_CATEGORY_SLUG,
} from "@/lib/indonesia-market-sections";

export type PortalNewsDetailResult = {
  article: PortalNewsItem | null;
  imageBase: string;
  latest: PortalNewsItem[];
  popular: PortalNewsItem[];
  related: PortalNewsItem[];
  source: PortalNewsSource;
};

type FetchPortalNewsDetailOptions = {
  latestLimit?: number;
  popularLimit?: number;
  relatedLimit?: number;
};

const applyLimit = (items: PortalNewsItem[], limit: number) =>
  items.slice(0, Math.max(0, limit));

const matchesCategory = (item: PortalNewsItem, value: string) => {
  const normalizedValue = normalizePortalNewsCategory(value);
  const categoryKeys = getPortalNewsCategoryKeys(item);

  return !normalizedValue || categoryKeys.includes(normalizedValue);
};

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const STOP_WORDS = new Set([
  "dan",
  "yang",
  "untuk",
  "dengan",
  "dari",
  "pada",
  "atau",
  "karena",
  "dalam",
  "akan",
  "ini",
  "itu",
  "the",
  "and",
  "with",
  "from",
  "for",
  "that",
  "this",
  "are",
  "was",
  "were",
  "will",
  "have",
  "has",
  "had",
  "its",
  "their",
]);

const tokenize = (value: string, tokenLimit: number) => {
  const tokens = stripHtml(value)
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

  return tokens.slice(0, tokenLimit);
};

const toTokenSet = (value: string, tokenLimit: number) =>
  new Set(tokenize(value, tokenLimit));

const countOverlap = (left: Set<string>, right: Set<string>) => {
  let overlap = 0;

  left.forEach((token) => {
    if (right.has(token)) {
      overlap += 1;
    }
  });

  return overlap;
};

const getRecencyBoost = (item: PortalNewsItem) => {
  const timestamp = getPortalNewsItemTimestamp(item);
  if (!timestamp) return 0;

  const ageMs = Date.now() - timestamp;
  if (ageMs <= 0) return 1.5;

  const ageDays = ageMs / (24 * 60 * 60 * 1000);

  if (ageDays <= 1) return 1.5;
  if (ageDays <= 3) return 1;
  if (ageDays <= 7) return 0.75;
  if (ageDays <= 14) return 0.35;
  return 0;
};

type SimilarityContext = {
  articleTitleTokens: Set<string>;
  articleContentTokens: Set<string>;
  normalizedCategory: string;
  categoryId?: number;
};

const scoreRelatedCandidate = (
  candidate: PortalNewsItem,
  context: SimilarityContext,
) => {
  const candidateTitleTokens = toTokenSet(
    resolvePortalNewsTitle(candidate),
    24,
  );
  const candidateContentTokens = toTokenSet(
    resolvePortalNewsContent(candidate),
    240,
  );

  const titleTitleOverlap = countOverlap(
    context.articleTitleTokens,
    candidateTitleTokens,
  );
  const titleContentOverlap = countOverlap(
    context.articleTitleTokens,
    candidateContentTokens,
  );
  const contentTitleOverlap = countOverlap(
    context.articleContentTokens,
    candidateTitleTokens,
  );
  const contentContentOverlap = countOverlap(
    context.articleContentTokens,
    candidateContentTokens,
  );

  const keywordScore =
    titleTitleOverlap * 7 +
    titleContentOverlap * 4 +
    contentTitleOverlap * 3 +
    Math.min(contentContentOverlap, 8);

  const sameCategoryIdBonus =
    typeof context.categoryId === "number" &&
    candidate.category_id === context.categoryId
      ? 3
      : 0;
  const sameCategoryKeyBonus = matchesCategory(
    candidate,
    context.normalizedCategory,
  )
    ? 2
    : 0;

  return (
    keywordScore +
    sameCategoryIdBonus +
    sameCategoryKeyBonus +
    getRecencyBoost(candidate)
  );
};

const resolveSource = (
  primary: PortalNewsSource,
  secondary: PortalNewsSource,
): PortalNewsSource =>
  primary === "newsmaker" || secondary === "newsmaker" ? "newsmaker" : "legacy";

export async function fetchPortalNewsDetail(
  slug: string,
  options: FetchPortalNewsDetailOptions = {},
): Promise<PortalNewsDetailResult> {
  const latestLimit = options.latestLimit ?? 5;
  const relatedLimit = options.relatedLimit ?? 3;
  const popularLimit = options.popularLimit ?? 5;

  const { item, source: articleSource } = await fetchPortalNewsArticle(slug);

  // Determine if this is a pasar-indonesia article
  const isPasarIndonesia = item
    ? getPortalNewsCategoryKeys(item).some(
        (key) => key === normalizePortalNewsCategory("pasar-indonesia"),
      )
    : false;
  const isAnalysis = item
    ? item.type === "analisis" ||
      matchesCategory(item, INDONESIA_MARKET_ANALYSIS_CATEGORY_SLUG)
    : false;

  const listResult = isPasarIndonesia
    ? await fetchPasarIndonesiaNews()
    : isAnalysis
      ? await fetchPasarIndonesiaAnalysis()
    : await fetchPortalNewsList();

  const { items, source: listSource } = listResult;
  const sortedItems = sortPortalNewsItemsByDate(items);
  const article =
    item ?? sortedItems.find((candidate) => candidate.slug === slug) ?? null;

  const normalizedCategory = normalizePortalNewsCategory(
    article ? getPortalNewsCategorySlug(article) : "",
  );
  const categoryId = article?.category_id;

  const sameCategoryItems = isPasarIndonesia
    ? sortedItems.filter((candidate) => candidate.slug !== article?.slug)
    : article
      ? sortedItems.filter((candidate) => {
          if (candidate.slug === article.slug) return false;

          if (
            typeof categoryId === "number" &&
            candidate.category_id === categoryId
          ) {
            return true;
          }

          return (
            normalizedCategory && matchesCategory(candidate, normalizedCategory)
          );
        })
      : [];

  const latestAllowedCategoryItems = isPasarIndonesia
    ? sortedItems.filter((candidate) => candidate.slug !== article?.slug)
    : sortedItems.filter((candidate) => {
        if (matchesCategory(candidate, INDONESIA_MARKET_NEWS_CATEGORY_SLUG)) {
          return true;
        }

        return matchesCategory(
          candidate,
          INDONESIA_MARKET_ANALYSIS_CATEGORY_SLUG,
        );
      });

  const fallbackPopular = article
    ? sortedItems.filter((candidate) => candidate.slug !== article.slug)
    : sortedItems;
  const articleTitleTokens = article
    ? toTokenSet(resolvePortalNewsTitle(article), 24)
    : new Set<string>();
  const articleContentTokens = article
    ? toTokenSet(resolvePortalNewsContent(article), 240)
    : new Set<string>();

  const hasCategoryIdentity =
    typeof categoryId === "number" || Boolean(normalizedCategory);
  const relatedCandidates = hasCategoryIdentity
    ? sameCategoryItems
    : fallbackPopular;

  const relatedRankedItems = article
    ? relatedCandidates
        .map((candidate) => ({
          item: candidate,
          score: scoreRelatedCandidate(candidate, {
            articleTitleTokens,
            articleContentTokens,
            normalizedCategory,
            categoryId,
          }),
        }))
        .sort(
          (left, right) =>
            right.score - left.score ||
            getPortalNewsItemTimestamp(right.item) -
              getPortalNewsItemTimestamp(left.item),
        )
    : [];

  const scoredRelatedItems = relatedRankedItems
    .filter((entry) => entry.score > 0)
    .map((entry) => entry.item);

  const relatedItemsPool =
    scoredRelatedItems.length > 0 ? scoredRelatedItems : relatedCandidates;

  return {
    article,
    imageBase: PORTALNEWS_IMAGE_BASE,
    latest: applyLimit(latestAllowedCategoryItems, latestLimit),
    popular: applyLimit(
      sameCategoryItems.length ? sameCategoryItems : fallbackPopular,
      popularLimit,
    ),
    related: applyLimit(relatedItemsPool, relatedLimit),
    source: resolveSource(articleSource, listSource),
  };
}
