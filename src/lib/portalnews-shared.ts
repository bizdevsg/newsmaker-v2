export type PortalNewsLocale = "en" | "id";

export type PortalNewsLocalizedText = {
  default?: string;
  id?: string;
  en?: string;
};

export type PortalNewsCategory = {
  id?: number;
  name?: string;
  slug?: string;
  articles_count?: number;
};

export type PortalNewsItem = {
  id?: number;
  title?: string;
  titles?: PortalNewsLocalizedText;
  slug?: string;
  content?: string;
  contents?: PortalNewsLocalizedText;
  category_id?: number;
  kategori?: PortalNewsCategory;
  main_category?: PortalNewsCategory;
  sub_category?: PortalNewsCategory;
  images?: string[];
  source?: string;
  author?: string;
  created_at?: string;
  updated_at?: string;
};

type PortalNewsLocalizedEntry = Pick<
  PortalNewsItem,
  "title" | "titles" | "content" | "contents"
>;

export const resolvePortalNewsLocale = (
  value?: string | null,
): PortalNewsLocale => (value === "en" ? "en" : "id");

const resolveLocalizedText = (
  value: PortalNewsLocalizedText | undefined,
  locale?: string | null,
  fallback?: string,
) => {
  const normalizedLocale = resolvePortalNewsLocale(locale);

  const preferred =
    normalizedLocale === "en"
      ? value?.en ?? value?.default ?? value?.id
      : value?.id ?? value?.default ?? value?.en;

  return preferred ?? fallback ?? "";
};

export const resolvePortalNewsTitle = (
  item: PortalNewsLocalizedEntry | null | undefined,
  locale?: string | null,
  fallback = "",
) =>
  resolveLocalizedText(item?.titles, locale, item?.title ?? fallback) || fallback;

export const resolvePortalNewsContent = (
  item: PortalNewsLocalizedEntry | null | undefined,
  locale?: string | null,
  fallback = "",
) =>
  resolveLocalizedText(
    item?.contents,
    locale,
    item?.content ?? fallback,
  ) || fallback;
