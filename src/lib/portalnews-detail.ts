import {
  fetchPortalNewsArticle,
  getPortalNewsCategoryKeys,
  getPortalNewsCategorySlug,
  fetchPortalNewsList,
  normalizePortalNewsCategory,
  PORTALNEWS_IMAGE_BASE,
  sortPortalNewsItemsByDate,
  type PortalNewsItem,
  type PortalNewsSource,
} from "@/lib/portalnews";

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

const resolveSource = (
  primary: PortalNewsSource,
  secondary: PortalNewsSource,
): PortalNewsSource =>
  primary === "newsmaker" || secondary === "newsmaker"
    ? "newsmaker"
    : "legacy";

export async function fetchPortalNewsDetail(
  slug: string,
  options: FetchPortalNewsDetailOptions = {},
): Promise<PortalNewsDetailResult> {
  const latestLimit = options.latestLimit ?? 5;
  const relatedLimit = options.relatedLimit ?? 3;
  const popularLimit = options.popularLimit ?? 5;

  const [{ item, source: articleSource }, { items, source: listSource }] =
    await Promise.all([fetchPortalNewsArticle(slug), fetchPortalNewsList()]);

  const sortedItems = sortPortalNewsItemsByDate(items);
  const article =
    item ?? sortedItems.find((candidate) => candidate.slug === slug) ?? null;

  const normalizedCategory = normalizePortalNewsCategory(
    article ? getPortalNewsCategorySlug(article) : "",
  );
  const categoryId = article?.category_id;

  const sameCategoryItems = article
    ? sortedItems.filter((candidate) => {
        if (candidate.slug === article.slug) return false;

        if (typeof categoryId === "number" && candidate.category_id === categoryId) {
          return true;
        }

        return (
          normalizedCategory &&
          matchesCategory(candidate, normalizedCategory)
        );
      })
    : [];

  const fallbackPopular = article
    ? sortedItems.filter((candidate) => candidate.slug !== article.slug)
    : sortedItems;

  return {
    article,
    imageBase: PORTALNEWS_IMAGE_BASE,
    latest: applyLimit(sortedItems, latestLimit),
    popular: applyLimit(
      sameCategoryItems.length ? sameCategoryItems : fallbackPopular,
      popularLimit,
    ),
    related: applyLimit(sameCategoryItems, relatedLimit),
    source: resolveSource(articleSource, listSource),
  };
}
