const TTL_MS = 6 * 60 * 60 * 1000

interface Options {
  fetchImpl?: (input: string, init?: RequestInit) => Promise<Response>
  storage?: Storage | null
  now?: () => number
}

function safeStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** Number of public repositories for `user`, cached for 6h. Null when unavailable (offline, rate limit…). */
export async function fetchPublicRepoCount(user: string, opts: Options = {}): Promise<number | null> {
  const { fetchImpl = fetch, storage = safeStorage(), now = Date.now } = opts
  const key = `gh-repos:${user}`

  try {
    const cached = storage?.getItem(key)
    if (cached) {
      const { value, at } = JSON.parse(cached) as { value: number; at: number }
      if (typeof value === 'number' && now() - at < TTL_MS) return value
    }
  } catch {
    /* ignore corrupt cache */
  }

  try {
    const res = await fetchImpl(`https://api.github.com/users/${encodeURIComponent(user)}`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { public_repos?: unknown }
    if (typeof data.public_repos !== 'number') return null
    try {
      storage?.setItem(key, JSON.stringify({ value: data.public_repos, at: now() }))
    } catch {
      /* storage full or blocked */
    }
    return data.public_repos
  } catch {
    return null
  }
}
