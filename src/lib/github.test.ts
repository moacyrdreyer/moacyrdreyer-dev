import { fetchPublicRepoCount } from './github'

function memoryStorage(): Storage {
  const m = new Map<string, string>()
  return {
    getItem: k => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: k => void m.delete(k),
    clear: () => m.clear(),
    key: i => [...m.keys()][i] ?? null,
    get length() { return m.size },
  }
}

const ok = (body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status: 200 }))

describe('fetchPublicRepoCount', () => {
  it('returns public_repos from the GitHub user endpoint', async () => {
    const fetchImpl = vi.fn(() => ok({ public_repos: 23 }))
    expect(await fetchPublicRepoCount('octo', { fetchImpl, storage: memoryStorage() })).toBe(23)
    expect(fetchImpl).toHaveBeenCalledWith('https://api.github.com/users/octo', expect.anything())
  })

  it('returns null on HTTP errors (e.g. rate limit)', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve(new Response('{}', { status: 403 })))
    expect(await fetchPublicRepoCount('octo', { fetchImpl, storage: memoryStorage() })).toBeNull()
  })

  it('returns null on network failure or malformed data', async () => {
    expect(await fetchPublicRepoCount('octo', { fetchImpl: () => Promise.reject(new Error('offline')), storage: memoryStorage() })).toBeNull()
    expect(await fetchPublicRepoCount('octo', { fetchImpl: () => ok({ nope: 1 }), storage: memoryStorage() })).toBeNull()
  })

  it('uses a fresh cached value without calling the network', async () => {
    const storage = memoryStorage()
    const now = 1_000_000
    storage.setItem('gh-repos:octo', JSON.stringify({ value: 9, at: now - 1000 }))
    const fetchImpl = vi.fn(() => ok({ public_repos: 50 }))
    expect(await fetchPublicRepoCount('octo', { fetchImpl, storage, now: () => now })).toBe(9)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('refetches when the cache is stale and stores the new value', async () => {
    const storage = memoryStorage()
    const now = 100_000_000
    storage.setItem('gh-repos:octo', JSON.stringify({ value: 9, at: 0 }))
    const fetchImpl = vi.fn(() => ok({ public_repos: 12 }))
    expect(await fetchPublicRepoCount('octo', { fetchImpl, storage, now: () => now })).toBe(12)
    expect(JSON.parse(storage.getItem('gh-repos:octo')!)).toEqual({ value: 12, at: now })
  })
})
