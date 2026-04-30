import type { PortalNewsItem } from "@/lib/portalnews";
import { normalizePortalNewsCategory } from "@/lib/portalnews";

type HeroTopicRule = {
  topic: string;
  aliases: string[];
};

const HERO_TOPIC_RULES: HeroTopicRule[] = [
  {
    topic: "makro-ekonomi",
    aliases: [
      "makro ekonomi",
      "macro economy",
      "global economy",
      "ekonomi global",
      "global economics",
      "global and economy",
      "fiscal moneter",
      "fiscal monetary",
      "moneter",
      "fiskal",
    ],
  },
  {
    topic: "pasar-saham",
    aliases: [
      "pasar saham",
      "stock market",
      "saham",
      "stock",
      "stocks",
      "ihsg",
      "idx",
      "equity",
      "equities",
    ],
  },
  {
    topic: "obligasi-sbn",
    aliases: [
      "obligasi",
      "obligasi sbn",
      "sbn",
      "bond",
      "bonds",
      "yield",
      "imbal hasil",
    ],
  },
  {
    topic: "rupiah-dan-valas",
    aliases: [
      "rupiah",
      "valas",
      "rupiah dan valas",
      "forex",
      "currency",
      "currencies",
      "fx",
      "us dollar",
      "dollar as",
      "dolar as",
      "usd index",
      "eur usd",
      "eurusd",
      "usd jpy",
      "usdjpy",
      "usd chf",
      "usdchf",
      "aud usd",
      "audusd",
      "gbp usd",
      "gbpusd",
    ],
  },
  {
    topic: "komoditas",
    aliases: [
      "komoditas",
      "commodity",
      "commodities",
      "gold",
      "gold corner",
      "emas",
      "xauusd",
      "xau usd",
      "silver",
      "perak",
      "xagusd",
      "xag usd",
      "oil",
      "minyak",
      "brent",
      "wti",
      "bco",
      "crude",
      "coal",
      "cpo",
      "nickel",
      "nikel",
    ],
  },
  {
    topic: "korporasi-emiten",
    aliases: [
      "korporasi",
      "emiten",
      "korporasi emiten",
      "corporate",
      "issuer",
      "issuers",
      "dividen",
      "dividend",
      "ipo",
      "laba",
      "earnings",
    ],
  },
  {
    topic: "investasi-strategi",
    aliases: [
      "investasi",
      "strategi",
      "investasi strategi",
      "investment",
      "strategy",
      "market analysis",
      "analisis market",
      "market analysis",
      "market outlook",
      "outlook",
    ],
  },
];

const HERO_TOPIC_LABELS: Record<string, string> = {
  "makro-ekonomi": "Makro Ekonomi",
  "pasar-saham": "Pasar Saham",
  "obligasi-sbn": "Obligasi & SBN",
  "rupiah-dan-valas": "Rupiah & Valas",
  komoditas: "Komoditas",
  "korporasi-emiten": "Korporasi & Emiten",
  "investasi-strategi": "Investasi & Strategi",
};

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, " and ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeHeroFilterValue = (value: string) =>
  normalizePortalNewsCategory(stripHtml(value).toLowerCase())
    .replace(/[^a-z0-9\s/&-]+/g, " ")
    .replace(/[&/_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const NORMALIZED_TOPIC_RULES = HERO_TOPIC_RULES.map((rule) => ({
  topic: rule.topic,
  aliases: rule.aliases.map(normalizeHeroFilterValue).filter(Boolean),
}));

const hasRequiredHeroFields = (item: PortalNewsItem) => {
  const slug = item.slug?.trim();
  const title =
    item.title_id?.trim() || item.title_en?.trim() || item.title?.trim();
  const image =
    item.image_url?.trim() || item.image?.trim() || item.images?.[0]?.trim();

  return Boolean(slug && title && image);
};

const getCategoryValues = (item: PortalNewsItem) =>
  [
    item.category,
    item.category_label,
    item.kategori?.slug,
    item.kategori?.name,
    item.sub_category?.slug,
    item.sub_category?.name,
    item.main_category?.slug,
    item.main_category?.name,
  ]
    .map((value) => normalizeHeroFilterValue(String(value ?? "")))
    .filter(Boolean);

const getTitleValues = (item: PortalNewsItem) =>
  [item.title_id, item.title_en, item.title, item.slug]
    .map((value) => normalizeHeroFilterValue(String(value ?? "")))
    .filter(Boolean);

const matchesAliases = (values: string[], aliases: string[]) =>
  values.some((value) =>
    aliases.some(
      (alias) =>
        value === alias || value.includes(alias) || alias.includes(value),
    ),
  );

export const resolveHeroSectionTopic = (item: PortalNewsItem) => {
  const categoryValues = getCategoryValues(item);
  const titleValues = getTitleValues(item);

  for (const rule of NORMALIZED_TOPIC_RULES) {
    if (matchesAliases(categoryValues, rule.aliases)) {
      return rule.topic;
    }
  }

  for (const rule of NORMALIZED_TOPIC_RULES) {
    if (matchesAliases(titleValues, rule.aliases)) {
      return rule.topic;
    }
  }

  return null;
};

export const resolveHeroSectionTopicLabel = (item: PortalNewsItem) => {
  const topic = resolveHeroSectionTopic(item);
  return topic ? (HERO_TOPIC_LABELS[topic] ?? null) : null;
};

export const filterHeroSectionNews = (items: PortalNewsItem[]) =>
  items.filter(
    (item) =>
      hasRequiredHeroFields(item) && resolveHeroSectionTopic(item) !== null,
  );
