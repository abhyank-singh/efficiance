// Tiny in-memory rate limiter (no dependency). Fine for a single-instance demo:
// state resets on restart, which is acceptable because a global daily cap backs it up.
const HOUR = 3600_000
const DAY = 24 * HOUR

const intEnv = (name, dflt) => {
  const n = Number.parseInt(process.env[name] ?? '', 10)
  return Number.isFinite(n) && n >= 0 ? n : dflt
}

export const isDemo = () => process.env.APP_MODE === 'demo'

// Demo: strict (public + costs money). Personal/local: generous (it's just you).
export const limits = () => ({
  perIpPerHour: intEnv('AI_LIMIT_PER_IP_HOUR', isDemo() ? 4 : 60),
  perIpPerDay: intEnv('AI_LIMIT_PER_IP_DAY', isDemo() ? 10 : 300),
  globalPerDay: intEnv('AI_LIMIT_GLOBAL_DAY', isDemo() ? 150 : 1000),
})

const hits = new Map() // ip -> number[] (timestamps, last 24h)
let globalDay = { start: Date.now(), count: 0 }

setInterval(() => { // keep memory bounded
  const cutoff = Date.now() - DAY
  for (const [ip, ts] of hits) {
    const kept = ts.filter((t) => t > cutoff)
    kept.length ? hits.set(ip, kept) : hits.delete(ip)
  }
}, HOUR).unref()

/** Express middleware: 429 with a friendly reason when a cap is hit. */
export function aiRateLimit(req, res, next) {
  const now = Date.now()
  const L = limits()
  if (now - globalDay.start > DAY) globalDay = { start: now, count: 0 }
  if (globalDay.count >= L.globalPerDay) {
    return res.status(429).json({ error: 'daily_cap', message: 'The demo has used up its free AI quota for today. Saved insights are still available.' })
  }
  const ip = req.ip || 'unknown'
  const ts = (hits.get(ip) || []).filter((t) => t > now - DAY)
  if (ts.length >= L.perIpPerDay || ts.filter((t) => t > now - HOUR).length >= L.perIpPerHour) {
    return res.status(429).json({ error: 'rate_limited', message: 'You have reached the demo limit for live AI. Saved insights are still available.' })
  }
  ts.push(now)
  hits.set(ip, ts)
  globalDay.count += 1
  next()
}
