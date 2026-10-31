import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import googleRouter from './google.js'
import insightsRouter from './insights.js'
import parseRouter from './parse.js'
import { isDemo } from './limits.js'

// The Express app, WITHOUT app.listen(); server/index.js starts it (Docker / Render / local).
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.disable('x-powered-by')
// Behind Render's proxy, trust 1 hop so req.ip is the real visitor (used by the AI rate limiter).
app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 1))

// Personal build: only answer to localhost names. Without this, a web page you visit can re-point its own
// domain at 127.0.0.1 ("DNS rebinding") and read your calendar from this server. Add names with ALLOWED_HOSTS.
const LOCAL_HOSTS = /^(localhost|127\.0\.0\.1|\[::1\])$/i
const EXTRA_HOSTS = (process.env.ALLOWED_HOSTS || '').split(',').map((h) => h.trim().toLowerCase()).filter(Boolean)
if (!isDemo()) {
  app.use((req, res, next) => {
    const host = String(req.headers.host || '').toLowerCase().replace(/:\d+$/, '')
    if (LOCAL_HOSTS.test(host) || EXTRA_HOSTS.includes(host)) return next()
    res.status(421).type('text/plain').send('Unexpected Host header. This personal build only answers on localhost.')
  })
}

// Security headers. The CSP allows only what the app uses: its own scripts, inline styles (React style props),
// Google Fonts, and the optional GoatCounter analytics host.
const CSP = [
  "default-src 'self'",
  "script-src 'self' https://gc.zgo.at",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data: https://*.goatcounter.com",
  "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://*.goatcounter.com",
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': CSP,
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), geolocation=(), payment=(), microphone=(self)', // microphone: Quick Add voice input
  })
  if (req.secure) res.set('Strict-Transport-Security', 'max-age=15552000')
  next()
})
app.use(express.json({ limit: '16kb' }))

app.get('/api/health', (req, res) => {
  const body = { ok: true, service: 'efficiance', mode: isDemo() ? 'demo' : 'personal' }
  // /api/health?ip=1 shows the address the server sees for YOU, to confirm TRUST_PROXY is right behind a proxy.
  if (req.query.ip === '1') body.clientIp = req.ip
  res.json(body)
})

// Google Calendar holds ONE server-wide token, so it must never be enabled on a public demo.
if (isDemo()) {
  app.use('/api/google', (req, res) => req.path === '/status' ? res.json({ configured: false, connected: false }) : res.status(404).end())
} else {
  app.use('/api/google', googleRouter)
}
app.use('/api/ai', insightsRouter)
app.use('/api/ai', parseRouter)

// Serve the built SPA from dist/.
const dist = path.resolve(__dirname, '..', 'dist')
// index.html carries %ORIGIN% placeholders (link-preview image/url must be absolute); fill from the request.
let indexHtml = null
const sendIndex = (req, res, next) => {
  try {
    indexHtml ??= fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
    // The Host header is attacker-controlled text: only plain hostname characters ever reach the HTML.
    const host = /^[a-z0-9.\-:[\]]{1,255}$/i.test(req.get('host') || '') ? req.get('host') : 'localhost'
    res.set('Cache-Control', 'no-cache').type('html').send(indexHtml.replaceAll('%ORIGIN%', `${req.protocol === 'https' ? 'https' : 'http'}://${host}`))
  } catch { next() }
}
app.use(express.static(dist, {
  index: false,
  setHeaders: (res, file) => {
    if (file.endsWith('sw.js')) res.setHeader('Cache-Control', 'no-cache') // always re-check the service worker
    else if (file.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable') // hashed filenames
  },
}))
app.get(/^\/(?!api\/).*/, sendIndex)

export default app
