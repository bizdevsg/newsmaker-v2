import { NextResponse } from "next/server";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IklanItem = {
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

const DEFAULT_IKLAN_URL = "http://portalnews.newsmaker.test/api/v1/newsmaker/iklan";
const IKLAN_URL = process.env.PORTALNEWS_IKLAN_URL || DEFAULT_IKLAN_URL;
const DEFAULT_IKLAN_TOKEN = "NPLD3SC2N06VVZYKUY5CRHJUQE3HSJ";
const IKLAN_TOKEN = process.env.PORTALNEWS_IKLAN_TOKEN || DEFAULT_IKLAN_TOKEN;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeIklanItem = (value: unknown): IklanItem | null => {
  if (!isRecord(value)) return null;

  return {
    id: typeof value.id === "number" ? value.id : undefined,
    title: typeof value.title === "string" ? value.title : undefined,
    description: typeof value.description === "string" ? value.description : null,
    image: typeof value.image === "string" ? value.image : null,
    image_url: typeof value.image_url === "string" ? value.image_url : null,
    cta_label: typeof value.cta_label === "string" ? value.cta_label : null,
    cta_url: typeof value.cta_url === "string" ? value.cta_url : null,
    modal_html: typeof value.modal_html === "string" ? value.modal_html : null,
    design_mode: typeof value.design_mode === "string" ? value.design_mode : null,
    has_custom_html:
      typeof value.has_custom_html === "boolean"
        ? value.has_custom_html
        : Boolean(value.modal_html),
    start_at: typeof value.start_at === "string" ? value.start_at : null,
    end_at: typeof value.end_at === "string" ? value.end_at : null,
    is_active: typeof value.is_active === "boolean" ? value.is_active : undefined,
    sort_order: typeof value.sort_order === "number" ? value.sort_order : undefined,
    created_at: typeof value.created_at === "string" ? value.created_at : null,
    updated_at: typeof value.updated_at === "string" ? value.updated_at : null,
  };
};

const toTimestamp = (value?: string | null) => {
  const timestamp = Date.parse(value ?? "");
  return Number.isNaN(timestamp) ? null : timestamp;
};

const isIklanActive = (iklan: IklanItem, now = Date.now()) => {
  if (iklan.is_active === false) return false;

  const startAt = toTimestamp(iklan.start_at);
  const endAt = toTimestamp(iklan.end_at);

  if (typeof startAt === "number" && now < startAt) return false;
  if (typeof endAt === "number" && now > endAt) return false;

  return true;
};

const compareIklan = (left: IklanItem, right: IklanItem) => {
  const leftSort = left.sort_order ?? Number.MAX_SAFE_INTEGER;
  const rightSort = right.sort_order ?? Number.MAX_SAFE_INTEGER;

  if (leftSort !== rightSort) return leftSort - rightSort;

  return (
    (Date.parse(right.updated_at ?? right.created_at ?? "") || 0) -
    (Date.parse(left.updated_at ?? left.created_at ?? "") || 0)
  );
};

export async function GET() {
  try {
    if (!IKLAN_URL || !IKLAN_TOKEN) {
      return NextResponse.json({
        status: "success",
        data: [],
        meta: { total: 0 },
      });
    }

    const response = await fetchWithTimeout(
      IKLAN_URL,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${IKLAN_TOKEN}`,
        },
        cache: "no-store",
      },
      10_000,
    );

    const payload = (await response.json().catch(() => null)) as
      | { status?: string; data?: unknown[]; meta?: Record<string, unknown>; message?: string }
      | null;

    if (!response.ok) {
      return NextResponse.json({
        status: "success",
        data: [],
        meta: { total: 0 },
      });
    }

    const items = Array.isArray(payload?.data)
      ? payload.data.map(normalizeIklanItem).filter(Boolean)
      : [];

    const activeItems = items
      .filter((item): item is IklanItem => item !== null)
      .filter((item) => isIklanActive(item))
      .sort(compareIklan);

    const data = activeItems.map((item) => ({
      id: String(item.id ?? ""),
      title: item.title ?? undefined,
      subtitle: item.description ?? undefined,
      ctaLabel: item.cta_label ?? undefined,
      href: item.cta_url ?? undefined,
      imageSrc: item.image_url ?? item.image ?? undefined,
      html: item.has_custom_html ? item.modal_html ?? undefined : undefined,
    }));

    return NextResponse.json({
      status: "success",
      data,
      meta: { total: data.length },
    });
  } catch (error: unknown) {
    console.error("Failed to fetch iklan", error);
    return NextResponse.json({
      status: "success",
      data: [],
      meta: { total: 0 },
    });
  }
}
