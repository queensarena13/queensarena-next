type CacheEntry = {
  data: unknown
  expires: number
}

const cache = new Map<string, CacheEntry>()

export async function withCache<T>(
  key: string,
  ttl: number,
  callback: () => Promise<T>
): Promise<T> {
  const now = Date.now()

  const existing = cache.get(key)

  if (
    existing &&
    existing.expires > now
  ) {
    return existing.data as T
  }

  const freshData = await callback()

  cache.set(key, {
    data: freshData,
    expires: now + ttl,
  })

  return freshData
}