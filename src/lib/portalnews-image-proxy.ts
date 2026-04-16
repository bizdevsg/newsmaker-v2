const LOCAL_IMAGE_HOSTS = new Set(["localhost", "127.0.0.1"]);

const PROXY_IMAGE_HOSTS = new Set([
  "portalnews.newsmaker.test",
  "portalnews.newsmaker.id",
  ...LOCAL_IMAGE_HOSTS,
]);

export const proxyPortalNewsImageUrl = (src: string) =>
  `/api/portalnews/image?url=${encodeURIComponent(src)}`;

export const resolvePortalNewsImageSrc = (src: string | null | undefined) => {
  if (!src) return null;
  const trimmed = src.trim();
  if (!trimmed) return null;

  if (!trimmed.startsWith("http")) return trimmed;

  try {
    const url = new URL(trimmed);
    const shouldProxy =
      LOCAL_IMAGE_HOSTS.has(url.hostname) ||
      (PROXY_IMAGE_HOSTS.has(url.hostname) && url.protocol === "http:");

    if (shouldProxy) {
      return proxyPortalNewsImageUrl(trimmed);
    }
    return trimmed;
  } catch {
    return trimmed;
  }
};
