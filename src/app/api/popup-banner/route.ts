import { NextResponse } from "next/server";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

type PopupBannerItem = {
  id?: number;
  title?: string;
  description?: string | null;
  image?: string | null;
  image_url?: string | null;
  cta_label?: string | null;
  cta_url?: string | null;
  modal_html?: string | null;
  design_mode?: string | null;
  has_custom_html?: boolean;
  start_at?: string | null;
  end_at?: string | null;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string | null;
  updated_at?: string | null;
};

const DEFAULT_POPUP_BANNER_URL =
  "http://portalnews.newsmaker.test/api/v1/newsmaker/popup-banner";
const POPUP_BANNER_URL =
  process.env.PORTALNEWS_POPUP_BANNER_URL || DEFAULT_POPUP_BANNER_URL;
const PORTALNEWS_POPUP_BANNER_TOKEN =
  process.env.PORTALNEWS_POPUP_BANNER_TOKEN ??
  "";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizePopupBannerItem = (value: unknown): PopupBannerItem | null => {
  if (!isRecord(value)) return null;

  return {
    id: typeof value.id === "number" ? value.id : undefined,
    title: typeof value.title === "string" ? value.title : undefined,
    description:
      typeof value.description === "string" ? value.description : null,
    image: typeof value.image === "string" ? value.image : null,
    image_url: typeof value.image_url === "string" ? value.image_url : null,
    cta_label: typeof value.cta_label === "string" ? value.cta_label : null,
    cta_url: typeof value.cta_url === "string" ? value.cta_url : null,
    modal_html: typeof value.modal_html === "string" ? value.modal_html : null,
    design_mode:
      typeof value.design_mode === "string" ? value.design_mode : null,
    has_custom_html:
      typeof value.has_custom_html === "boolean"
        ? value.has_custom_html
        : Boolean(value.modal_html),
    start_at: typeof value.start_at === "string" ? value.start_at : null,
    end_at: typeof value.end_at === "string" ? value.end_at : null,
    is_active:
      typeof value.is_active === "boolean" ? value.is_active : undefined,
    sort_order:
      typeof value.sort_order === "number" ? value.sort_order : undefined,
    created_at: typeof value.created_at === "string" ? value.created_at : null,
    updated_at: typeof value.updated_at === "string" ? value.updated_at : null,
  };
};

const toTimestamp = (value?: string | null) => {
  const timestamp = Date.parse(value ?? "");
  return Number.isNaN(timestamp) ? null : timestamp;
};

const isBannerActive = (banner: PopupBannerItem, now = Date.now()) => {
  if (banner.is_active === false) return false;

  const startAt = toTimestamp(banner.start_at);
  const endAt = toTimestamp(banner.end_at);

  if (typeof startAt === "number" && now < startAt) return false;
  if (typeof endAt === "number" && now > endAt) return false;

  return true;
};

const comparePopupBanners = (left: PopupBannerItem, right: PopupBannerItem) => {
  const leftSort = left.sort_order ?? Number.MAX_SAFE_INTEGER;
  const rightSort = right.sort_order ?? Number.MAX_SAFE_INTEGER;

  if (leftSort !== rightSort) {
    return leftSort - rightSort;
  }

  return (
    (Date.parse(right.updated_at ?? right.created_at ?? "") || 0) -
    (Date.parse(left.updated_at ?? left.created_at ?? "") || 0)
  );
};

export async function GET() {
  try {
    if (!POPUP_BANNER_URL) {
      return NextResponse.json(
        {
          status: "error",
          message: "PORTALNEWS_POPUP_BANNER_URL is not configured",
        },
        { status: 500 },
      );
    }

    const response = await fetchWithTimeout(
      POPUP_BANNER_URL,
      {
        headers: {
          Accept: "application/json",
          ...(PORTALNEWS_POPUP_BANNER_TOKEN
            ? { Authorization: `Bearer ${PORTALNEWS_POPUP_BANNER_TOKEN}` }
            : {}),
        },
        cache: "no-store",
      },
      10_000,
    );

    const payload = (await response.json().catch(() => null)) as {
      status?: string;
      data?: unknown[];
      meta?: Record<string, unknown>;
      message?: string;
    } | null;

    if (!response.ok) {
      return NextResponse.json(
        {
          status: "error",
          message:
            payload?.message ||
            `Failed to fetch popup banner (${response.status})`,
        },
        { status: 502 },
      );
    }

    const items = Array.isArray(payload?.data)
      ? payload.data.map(normalizePopupBannerItem).filter(Boolean)
      : [];

    const activeItems = items
      .filter((item): item is PopupBannerItem => item !== null)
      .filter((item) => isBannerActive(item))
      .sort(comparePopupBanners);

    return NextResponse.json({
      status: "success",
      data: activeItems,
      meta: {
        total: activeItems.length,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
