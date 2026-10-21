import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Google Calendar OAuth (read-only) using plain fetch — no SDK needed.
// Tokens persist to a git-ignored file so a server restart doesn't drop the connection.

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TOKEN_FILE = path.join(__dirname, '..', '.google-tokens.json')

const router = Router()

let tokens = null
try { tokens = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8')) } catch { /* not connected yet */ }

const saveTokens = (t) => {
  tokens = t
  try { fs.writeFileSync(TOKEN_FILE, JSON.stringify(t)) } catch { /* fs readonly — keep in memory */ }
}

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
  res.redirect(url.toString())
})

router.get('/callback', async (req, res) => {
  const { id, secret, redirect } = cfg()
  const code = req.query.code
  if (!code) return res.redirect(appOrigin() + '/calendar?google=error')
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
