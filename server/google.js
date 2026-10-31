import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'

// Google Calendar OAuth (read-only) using plain fetch — no SDK needed.
// Tokens persist to a git-ignored file so a server restart doesn't drop the connection.

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TOKEN_FILE = path.join(__dirname, '..', '.google-tokens.json')

const router = Router()

let tokens = null
try { tokens = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8')) } catch { /* not connected yet */ }

const saveTokens = (t) => {
  tokens = t
  try {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(t), { mode: 0o600 }) // owner-only: the refresh token lives here
    fs.chmodSync(TOKEN_FILE, 0o600) // also tightens a file written by an older version
  } catch { /* fs readonly, keep in memory */ }
}

// ---- Request guards -------------------------------------------------------------------------------------------
// Any website you visit can make your browser POST to localhost. State-changing calls must come from this app.
const DEV_ORIGINS = new Set(['http://localhost:5173', 'http://127.0.0.1:5173']) // the Vite dev server proxies here
const sameSite = (req) => {
  const origin = req.get('origin')
  if (origin) { try { return new URL(origin).host === req.get('host') || DEV_ORIGINS.has(origin) } catch { return false } }
  const fetchSite = req.get('sec-fetch-site') // absent for non-browser clients such as curl
  return !fetchSite || fetchSite === 'same-origin' || fetchSite === 'none'
}
router.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method) || sameSite(req)) return next()
  res.status(403).json({ error: 'cross_site_request_blocked' })
})

// OAuth `state`: binds the Google redirect back to the browser that started the flow (blocks login CSRF).
const STATE_COOKIE = 'efi_oauth_state'
const readCookie = (req, name) => (req.headers.cookie || '').split(';').map((c) => c.trim()).find((c) => c.startsWith(name + '='))?.slice(name.length + 1)
const safeEqual = (a, b) => typeof a === 'string' && typeof b === 'string' && a.length === b.length && a.length > 0 && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))

const cfg = () => ({
  id: process.env.GOOGLE_CLIENT_ID,
  secret: process.env.GOOGLE_CLIENT_SECRET,
  redirect: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/google/callback',
})

const appOrigin = () =>
  process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173'

router.get('/status', (_req, res) => {
  const { id, secret } = cfg()
  res.json({ configured: Boolean(id && secret), connected: Boolean(tokens) })
})

router.get('/auth', (req, res) => {
  const { id, secret, redirect } = cfg()
  if (!id || !secret) {
    return res.status(400).send('Google OAuth is not configured yet — add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env and restart.')
  }
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', id)
  url.searchParams.set('redirect_uri', redirect)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar.readonly')
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent')
  const state = crypto.randomBytes(16).toString('hex')
  res.cookie(STATE_COOKIE, state, { httpOnly: true, sameSite: 'lax', maxAge: 10 * 60 * 1000, path: '/api/google' })
  url.searchParams.set('state', state)
  res.redirect(url.toString())
})

router.get('/callback', async (req, res) => {
  const { id, secret, redirect } = cfg()
  const code = req.query.code
  const stateOk = safeEqual(req.query.state, readCookie(req, STATE_COOKIE))
  res.clearCookie(STATE_COOKIE, { path: '/api/google' })
  if (!code || !stateOk) return res.redirect(appOrigin() + '/calendar?google=error')
  try {
    const r = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: id, client_secret: secret,
        redirect_uri: redirect, grant_type: 'authorization_code',
      }),
    })
    const data = await r.json()
    if (!data.access_token) throw new Error(data.error_description || 'no access token')
    saveTokens({ ...data, obtained_at: Date.now() })
    res.redirect(appOrigin() + '/calendar?google=connected')
  } catch (err) {
    console.error('Google OAuth callback failed:', err.message)
    res.redirect(appOrigin() + '/calendar?google=error')
  }
})

async function freshAccessToken() {
  if (!tokens) return null
  const ageMs = Date.now() - (tokens.obtained_at || 0)
  if (ageMs < (tokens.expires_in - 120) * 1000) return tokens.access_token
  // expired — refresh
  const { id, secret } = cfg()
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: tokens.refresh_token, client_id: id, client_secret: secret,
      grant_type: 'refresh_token',
    }),
  })
  const data = await r.json()
  if (!data.access_token) return null
  saveTokens({ ...tokens, ...data, obtained_at: Date.now() })
  return data.access_token
}

router.get('/events', async (_req, res) => {
  try {
    const token = await freshAccessToken()
    if (!token) return res.status(401).json({ error: 'not connected' })
    const now = new Date()
    const weekOut = new Date(now.getTime() + 7 * 24 * 3600 * 1000)
    const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events')
    url.searchParams.set('timeMin', now.toISOString())
    url.searchParams.set('timeMax', weekOut.toISOString())
    url.searchParams.set('singleEvents', 'true')
    url.searchParams.set('orderBy', 'startTime')
    url.searchParams.set('maxResults', '20')
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    const data = await r.json()
    if (data.error) return res.status(502).json({ error: data.error.message })
    const events = (data.items || []).map((e) => ({
      id: e.id,
      title: e.summary || '(no title)',
      start: e.start?.dateTime || e.start?.date,
      end: e.end?.dateTime || e.end?.date,
      allDay: !e.start?.dateTime,
    }))
    res.json({ events })
  } catch (err) {
    console.error('Google events fetch failed:', err.message)
    res.status(502).json({ error: 'fetch failed' })
  }
})

router.post('/disconnect', (_req, res) => {
  tokens = null
  try { fs.unlinkSync(TOKEN_FILE) } catch { /* already gone */ }
  res.json({ ok: true })
})

export default router
