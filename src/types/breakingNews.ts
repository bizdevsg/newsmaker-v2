export type BreakingNewsItem = {
  id?: number;
  slug?: string;
  image?: string | null;
  image_url?: string | null;
  title_id?: string | null;
  title_en?: string | null;
  content_id?: string | null;
  content_en?: string | null;
  author?: string | null;
  source?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  breaking_news_category?: {
    id?: number;
    name?: string;
    slug?: string;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ActiveBreakingNews = {
  key: string;
  title: string;
  image: string | null;
  category: string;
  timeLabel: string;
  href: string;
  remainingMs: number;
};
