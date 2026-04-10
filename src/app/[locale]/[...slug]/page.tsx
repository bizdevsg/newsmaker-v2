import { notFound } from "next/navigation";
import IndonesiaMarketNewsCategoryPage from "../indonesia-market/news/[kategori]/page";
import IndonesiaMarketNewsDetailPage from "../indonesia-market/news/[kategori]/[slug]/page";

export default async function LocaleCatchAllPage({
  params,
}: {
  params: Promise<{ locale?: string; slug?: string[] }>;
}) {
  const { locale: rawLocale, slug: segments = [] } = await params;
  const locale = rawLocale === "en" ? "en" : "id";

  if (segments.length >= 2 && segments[0] === "indonesia-market") {
    if (segments[1] === "news") {
      const kategori = segments[2];
      const articleSlug = segments[3];

      if (kategori && articleSlug) {
        return IndonesiaMarketNewsDetailPage({
          params: Promise.resolve({ locale, kategori, slug: articleSlug }),
        });
      }

      if (kategori) {
        return IndonesiaMarketNewsCategoryPage({
          params: Promise.resolve({ locale, kategori }),
        });
      }
    }
  }

  notFound();
}
