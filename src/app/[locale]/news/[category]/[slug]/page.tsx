import type { Metadata } from "next";
import { getMessages, type Locale } from "@/locales";
import { MarketPageTemplate } from "@/components/templates/MarketPageTemplate";
import { NewsArticleDetail } from "@/components/organisms/NewsArticleDetail";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

const NEWS_API = process.env.NEXT_PUBLIC_PORTALNEWS_API_URL ?? "";
const NEWS_TOKEN = process.env.NEXT_PUBLIC_PORTALNEWS_TOKEN ?? "";
const IMAGE_BASE = process.env.NEXT_PUBLIC_PORTALNEWS_IMAGE_BASE ?? "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

type NewsItem = {
  title?: string;
  titles?: { default?: string };
  content?: string;
  slug?: string;
  images?: string[];
  kategori?: { slug?: string; name?: string };
  updated_at?: string;
  created_at?: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string; category: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, category, slug } = await params;
  const locale = rawLocale === "en" ? "en" : "id";

  let title = "Newsmaker 23";
  let description = "Latest market update from Newsmaker 23.";
  let imageUrl: string | undefined;

  if (NEWS_API) {
    try {
      const res = await fetchWithTimeout(NEWS_API, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${NEWS_TOKEN}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        const all: NewsItem[] = Array.isArray(json?.data) ? json.data : [];
        const found = all.find((item) => item.slug === slug);
        if (found) {
          title = found.titles?.default || found.title || title;
          const plain = stripHtml(found.content ?? "");
          if (plain) {
            description =
              plain.length > 160 ? `${plain.slice(0, 160).trim()}...` : plain;
          }
          const img = found.images?.[0];
          if (img) {
            imageUrl = img.startsWith("http")
              ? img
              : `${IMAGE_BASE}${img}`;
          }
        }
      }
    } catch {
      // keep defaults
    }
  }

  const absoluteUrl = SITE_URL
    ? `${SITE_URL}/${locale}/news/${category}/${slug}`
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: absoluteUrl,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function NewsArticlePage({
    params,
}: {
    params: Promise<{ locale?: string; category: string; slug: string }>;
}) {
    const { locale: rawLocale, category, slug } = await params;
    const locale: Locale = rawLocale === "en" ? "en" : "id";
    const messages = getMessages(locale);

    const customMessages = {
        ...messages,
        header: {
            ...messages.header,
            activeNavKey: "equities",
        },
    };

    return (
        <MarketPageTemplate locale={locale} messages={customMessages}>
            <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100 min-h-[80vh]">
                <NewsArticleDetail
                    slug={slug}
                    categorySlug={category}
                    locale={locale}
                    messages={customMessages}
                    isEconomic={false}
                />
            </section>
        </MarketPageTemplate>
    );
}
