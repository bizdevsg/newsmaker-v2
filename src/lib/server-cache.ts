type CacheEntry<T> = {
  expiresAt: number;
  hasValue: boolean;
  value?: T;
  pending?: Promise<T>;
};

type GlobalWithServerCache = typeof globalThis & {
  __newsmakerServerCache__?: Map<string, CacheEntry<unknown>>;
};

const globalWithServerCache = globalThis as GlobalWithServerCache;

const serverCache =
  globalWithServerCache.__newsmakerServerCache__ ??
  new Map<string, CacheEntry<unknown>>();

if (!globalWithServerCache.__newsmakerServerCache__) {
  globalWithServerCache.__newsmakerServerCache__ = serverCache;
}

export async function getCachedValue<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const existing = serverCache.get(key) as CacheEntry<T> | undefined;

  if (existing?.hasValue && existing.expiresAt > now) {
    return existing.value as T;
  }

  if (existing?.pending) {
    return existing.pending;
  }

  const nextEntry: CacheEntry<T> = existing
    ? { ...existing }
    : {
        expiresAt: 0,
        hasValue: false,
      };

  nextEntry.pending = loader()
    .then((value) => {
      serverCache.set(key, {
        expiresAt: Date.now() + ttlSeconds * 1_000,
        hasValue: true,
        value,
      });
      return value;
    })
    .catch((error: unknown) => {
      if (existing?.hasValue) {
        serverCache.set(key, {
          expiresAt: Date.now() + Math.max(1, Math.floor(ttlSeconds / 2)) * 1_000,
          hasValue: true,
          value: existing.value,
        });
        return existing.value as T;
      }

      serverCache.delete(key);
      throw error;
    });

  serverCache.set(key, nextEntry);
  return nextEntry.pending;
}

export const buildPublicCacheControl = (
  maxAgeSeconds: number,
  staleWhileRevalidateSeconds = maxAgeSeconds,
) =>
  `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`;
