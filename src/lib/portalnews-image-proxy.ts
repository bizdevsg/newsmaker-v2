const LOCAL_IMAGE_HOSTS = new Set([
  "portalnews.newsmaker.test",
  "localhost",
  "127.0.0.1",
]);

const DEFAULT_PROXY_HOSTS = new Set([
  ...LOCAL_IMAGE_HOSTS,
  // Production portal host (some upstream responses still reference http URLs).
  "portalnews.newsmaker.id",
]);

const parseEnvHosts = (value: string) =>
  value
    .split(/[,\s]+/g)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .flatMap((entry) => {
      try {
        return [new URL(entry).hostname];
      } catch {
        // Allow raw hostname values (e.g. "192.168.1.10" or "api.internal").
        return /^[a-z0-9.-]+$/i.test(entry) ? [entry] : [];
      }
    });

const PROXY_HOSTS = (() => {
  const hosts = new Set(DEFAULT_PROXY_HOSTS);

  const maybeUrls = [
    process.env.NEXT_PUBLIC_PORTALNEWS_IMAGE_BASE,
    process.env.NEXT_PUBLIC_PORTALNEWS_API_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ].filter(Boolean) as string[];

  for (const value of maybeUrls) {
    try {
      hosts.add(new URL(value).hostname);
    } catch {
      // ignore
    }
  }

  const extra = process.env.NEXT_PUBLIC_PORTALNEWS_PROXY_HOSTS;
  if (extra) {
    for (const host of parseEnvHosts(extra)) hosts.add(host);
  }

  return hosts;
})();

export const proxyPortalNewsImageUrl = (src: string) =>
  `/api/portalnews/image?url=${encodeURIComponent(src)}`;

export const resolvePortalNewsImageSrc = (src: string | null | undefined) => {
  if (!src) return null;
  const trimmed = src.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (!trimmed.startsWith("http")) return trimmed;

  try {
    const url = new URL(trimmed);
    const isSecureContext =
      typeof window !== "undefined" && window.location.protocol === "https:";

    // Always proxy local/dev hostnames so tunneled traffic can still load images.
    // Also proxy http images when the page is served over https to avoid mixed-content blocking.
    if (
      LOCAL_IMAGE_HOSTS.has(url.hostname) ||
      (isSecureContext && url.protocol === "http:" && PROXY_HOSTS.has(url.hostname))
    ) {
      return proxyPortalNewsImageUrl(trimmed);
    }
    return trimmed;
  } catch {
    return trimmed;
  }
};
