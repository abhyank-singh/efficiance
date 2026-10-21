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
app.use((_req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' })
  next()
})
app.use(express.json({ limit: '16kb' }))

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'efficiance',
    mode: isDemo() ? 'demo' : 'personal',
  })
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
    res.type('html').send(indexHtml.replaceAll('%ORIGIN%', `${req.protocol}://${req.get('host')}`))
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
