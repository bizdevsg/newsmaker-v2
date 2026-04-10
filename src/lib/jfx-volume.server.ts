import "server-only";

import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import type { JfxVolumeResponse } from "@/types/indonesiaMarket";

const API_BASE =
  process.env.ENDPO_NM23_BASE ??
  process.env.NEXT_PUBLIC_ENDPOAPI_BASE ??
  "https://endpo-nm23.vercel.app";

const JFX_VOLUME_URL = `${API_BASE}/api/newsmaker-v2/jfx/volume`;

export async function fetchJfxVolume(): Promise<JfxVolumeResponse | null> {
  try {
    const response = await fetchWithTimeout(
      JFX_VOLUME_URL,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 60 },
      },
      10_000,
    );

    if (!response.ok) return null;

    return (await response.json().catch(() => null)) as JfxVolumeResponse | null;
  } catch {
    return null;
  }
}

