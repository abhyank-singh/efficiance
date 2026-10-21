// Tiny in-memory rate limiter (no dependency). Fine for a single-instance demo:
// state resets on restart, which is acceptable because a global daily cap backs it up.
const HOUR = 3600_000
const DAY = 24 * HOUR

const intEnv = (name, dflt) => {
  const n = Number.parseInt(process.env[name] ?? '', 10)
  return Number.isFinite(n) && n >= 0 ? n : dflt
}

export const isDemo = () => process.env.APP_MODE === 'demo'

const buckets = new Map() // name -> { hits: Map<ip, number[]>, globalDay }

/**
 * Build an Express rate-limit middleware for one feature.
 * Demo: strict (public + costs money). Personal/local: generous (it's just you).
 * Env overrides: <PREFIX>_PER_IP_HOUR / _PER_IP_DAY / _GLOBAL_DAY.
 */
export function makeLimiter({ name, prefix, demo, personal, message }) {
  const state = { hits: new Map(), globalDay: { start: Date.now(), count: 0 } }
  buckets.set(name, state)
  const L = () => {
    const d = isDemo() ? demo : personal
    return {
      perIpPerHour: intEnv(`${prefix}_PER_IP_HOUR`, d[0]),
      perIpPerDay: intEnv(`${prefix}_PER_IP_DAY`, d[1]),
      globalPerDay: intEnv(`${prefix}_GLOBAL_DAY`, d[2]),
    }
  }
  return function limiter(req, res, next) {
    const now = Date.now()
    const lim = L()
    if (now - state.globalDay.start > DAY) state.globalDay = { start: now, count: 0 }
    if (state.globalDay.count >= lim.globalPerDay) {
      return res.status(429).json({ error: 'daily_cap', message: `The demo has used up its free AI quota for today. ${message}` })
    }
    const ip = req.ip || 'unknown'
    const ts = (state.hits.get(ip) || []).filter((t) => t > now - DAY)
    if (ts.length >= lim.perIpPerDay || ts.filter((t) => t > now - HOUR).length >= lim.perIpPerHour) {
      return res.status(429).json({ error: 'rate_limited', message: `You have reached the demo limit for live AI. ${message}` })
    }
    ts.push(now)
    state.hits.set(ip, ts)
    state.globalDay.count += 1
    next()
  }
}

setInterval(() => { // keep memory bounded
  const cutoff = Date.now() - DAY
  for (const { hits } of buckets.values()) {
    for (const [ip, ts] of hits) {
      const kept = ts.filter((t) => t > cutoff)
      kept.length ? hits.set(ip, kept) : hits.delete(ip)
    }
  }
}, HOUR).unref()

// [perIpPerHour, perIpPerDay, globalPerDay]
export const aiRateLimit = makeLimiter({
  name: 'insights', prefix: 'AI_LIMIT', demo: [4, 10, 150], personal: [60, 300, 1000],
  message: 'Saved insights are still available.',
})
export const parseRateLimit = makeLimiter({
  name: 'parse', prefix: 'AI_PARSE_LIMIT', demo: [20, 60, 400], personal: [200, 1000, 5000],
  message: 'Instant (offline) parsing still works.',
})
