const LOCAL_IMAGE_HOSTS = new Set([
  "portalnews.newsmaker.test",
  "localhost",
  "127.0.0.1",
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
    if (LOCAL_IMAGE_HOSTS.has(url.hostname)) {
      return proxyPortalNewsImageUrl(trimmed);
    }
    return trimmed;
  } catch {
    return trimmed;
  }
};

