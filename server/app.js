import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import googleRouter from './google.js'
import insightsRouter from './insights.js'
import { isDemo } from './limits.js'

// The Express app, WITHOUT app.listen(). This lets the exact same app run three ways:
//   - as a long-running Node server (Docker / Render / Railway / local) via server/index.js
//   - as a Vercel serverless function via api/index.js
//   - as a Netlify function via netlify/functions/api.js
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

// Serve the built SPA from dist/. Used by the Node/Docker path. On Vercel/Netlify the
// platform serves dist/ as static assets and only routes /api/* to the function, so this
// static block simply never runs there — it is harmless.
const dist = path.resolve(__dirname, '..', 'dist')
// index.html carries %ORIGIN% placeholders (link-preview image/url must be absolute); fill from the request.
let indexHtml = null
const sendIndex = (req, res, next) => {
  try {
    indexHtml ??= fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
    res.type('html').send(indexHtml.replaceAll('%ORIGIN%', `${req.protocol}://${req.get('host')}`))
  } catch { next() }
}
app.use(express.static(dist, { index: false }))
app.get(/^\/(?!api\/).*/, sendIndex)

export default app
