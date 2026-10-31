// Security regression tests. Run with `npm test` (Node's built-in runner, no extra dependencies).
// Each test starts the real server as a child process on a free loopback port, so what is tested is what ships.
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import http from 'node:http'
import net from 'node:net'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { ipKey } from '../server/limits.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const servers = []

const freePort = () => new Promise((resolve) => { const s = net.createServer().listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)) }) })

async function start(env = {}) {
  const port = await freePort()
  const child = spawn(process.execPath, ['server/index.js'], {
    cwd: ROOT,
    env: { PATH: process.env.PATH, PORT: String(port), ...env }, // explicit env only: no ambient secrets leak into tests
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let log = ''
  child.stdout.on('data', (d) => { log += d })
  child.stderr.on('data', (d) => { log += d })
  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('server did not start: ' + log)), 8000)
    const poll = setInterval(() => { if (/listening/.test(log)) { clearTimeout(t); clearInterval(poll); resolve() } }, 50)
  })
  const srv = { port, env, get log() { return log }, stop: () => child.kill() }
  servers.push(srv)
  return srv
}

// node:http (not fetch) because fetch forbids setting the Host header, which several tests need.
function req(srv, { method = 'GET', url = '/api/health', headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const r = http.request({ host: '127.0.0.1', port: srv.port, path: url, method, headers }, (res) => {
      let body = ''
      res.on('data', (d) => { body += d })
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }))
    })
    r.on('error', reject)
    r.end()
  })
}

after(() => servers.forEach((s) => s.stop()))

/* ───────────── C1: the personal build is only reachable as localhost ───────────── */
test('personal build binds loopback only and answers only to localhost names', async () => {
  const s = await start({ APP_MODE: 'personal' })
  assert.match(s.log, /http:\/\/127\.0\.0\.1:\d+/, 'must listen on 127.0.0.1, not all interfaces')
  assert.doesNotMatch(s.log, /all interfaces/)
  for (const host of [`localhost:${s.port}`, `127.0.0.1:${s.port}`, `[::1]:${s.port}`]) {
    assert.equal((await req(s, { headers: { Host: host } })).status, 200, `${host} should be allowed`)
  }
  for (const host of ['evil.example', `evil.example:${s.port}`, '192.168.1.20:3001', 'localhost.evil.example']) {
    assert.equal((await req(s, { headers: { Host: host } })).status, 421, `${host} must be rejected (DNS rebinding / LAN name)`)
  }
})

test('personal build: calendar events are not served to a rebinding hostname', async () => {
  const s = await start({ APP_MODE: 'personal' })
  const r = await req(s, { url: '/api/google/events', headers: { Host: 'attacker.example' } })
  assert.equal(r.status, 421)
  assert.doesNotMatch(r.body, /events/)
})

test('ALLOWED_HOSTS lets the owner add a name deliberately', async () => {
  const s = await start({ APP_MODE: 'personal', ALLOWED_HOSTS: 'mymac.local' })
  assert.equal((await req(s, { headers: { Host: 'mymac.local:3001' } })).status, 200)
  assert.equal((await req(s, { headers: { Host: 'other.local' } })).status, 421)
})

/* ───────────── C2: cross-site writes and OAuth state ───────────── */
test('state-changing Google routes reject cross-site requests', async () => {
  const s = await start({ APP_MODE: 'personal' })
  const host = `localhost:${s.port}`
  const post = (headers) => req(s, { method: 'POST', url: '/api/google/disconnect', headers: { Host: host, ...headers } })
  assert.equal((await post({ Origin: 'https://evil.example' })).status, 403)
  assert.equal((await post({ 'Sec-Fetch-Site': 'cross-site' })).status, 403)
  assert.equal((await post({ Origin: `http://${host}` })).status, 200, 'same-origin app request works')
  assert.equal((await post({})).status, 200, 'non-browser client (no Origin, no Fetch-Metadata) works')
})

test('OAuth sends an unguessable state bound to a cookie, and the callback requires it', async () => {
  const s = await start({ APP_MODE: 'personal', GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 'secret' })
  const host = { Host: `localhost:${s.port}` }
  const auth = await req(s, { url: '/api/google/auth', headers: host })
  assert.equal(auth.status, 302)
  const state = new URL(auth.headers.location).searchParams.get('state')
  assert.match(state, /^[0-9a-f]{32}$/)
  const cookie = [].concat(auth.headers['set-cookie'])[0]
  assert.match(cookie, /efi_oauth_state=/); assert.match(cookie, /HttpOnly/i); assert.match(cookie, /SameSite=Lax/i)
  const bad = (headers = {}, qs = 'code=abc&state=wrong') => req(s, { url: `/api/google/callback?${qs}`, headers: { ...host, ...headers } })
  assert.match((await bad()).headers.location, /google=error/, 'no cookie: rejected')
  assert.match((await bad({ Cookie: `efi_oauth_state=${state}` })).headers.location, /google=error/, 'state mismatch: rejected')
  assert.match((await bad({ Cookie: `efi_oauth_state=${state}` }, 'code=abc')).headers.location, /google=error/, 'missing state: rejected')
})

/* ───────────── demo build ───────────── */
test('demo build: calendar routes are off, any Host works (Render), security headers are set', async () => {
  const s = await start({ APP_MODE: 'demo' })
  assert.match(s.log, /all interfaces/, 'the public demo must listen on all interfaces')
  for (const [method, url] of [['GET', '/api/google/events'], ['GET', '/api/google/auth'], ['POST', '/api/google/disconnect']]) {
    assert.equal((await req(s, { method, url })).status, 404, `${method} ${url} must not exist in demo`)
  }
  const r = await req(s, { headers: { Host: 'efficiance.onrender.com' } })
  assert.equal(r.status, 200)
  const csp = r.headers['content-security-policy']
  assert.match(csp, /default-src 'self'/); assert.match(csp, /frame-ancestors 'none'/); assert.match(csp, /object-src 'none'/)
  assert.doesNotMatch(csp, /script-src[^;]*'unsafe-inline'/, 'no inline scripts allowed')
  assert.equal(r.headers['x-frame-options'], 'DENY'); assert.equal(r.headers['x-content-type-options'], 'nosniff')
  assert.match(r.headers['permissions-policy'], /geolocation=\(\)/)
})

test('Host header text never reaches the served HTML unescaped', { skip: !existsSync(path.join(ROOT, 'dist', 'index.html')) && 'run `npm run build` first' }, async () => {
  const s = await start({ APP_MODE: 'demo' })
  const r = await req(s, { url: '/', headers: { Host: 'x"><script>alert(1)</script>' } })
  assert.equal(r.status, 200)
  assert.doesNotMatch(r.body, /<script>alert\(1\)/)
  assert.doesNotMatch(r.body, /%ORIGIN%/, 'placeholder must be replaced')
})

/* ───────────── C3: rate limiting identity ───────────── */
test('ipKey groups IPv6 by /64 and unwraps IPv4-mapped addresses', () => {
  assert.equal(ipKey('203.0.113.7'), '203.0.113.7')
  assert.equal(ipKey('::ffff:203.0.113.7'), '203.0.113.7')
  assert.equal(ipKey('2001:db8:abcd:12:aaaa:bbbb:cccc:dddd'), ipKey('2001:db8:abcd:12:1:2:3:4'))
  assert.notEqual(ipKey('2001:db8:abcd:12::1'), ipKey('2001:db8:abcd:13::1'))
  assert.equal(ipKey('2001:db8::1'), '2001:db8:0:0::/64')
  assert.equal(ipKey(undefined), 'unknown')
})

test('rotating addresses inside one IPv6 /64 does not dodge the per-visitor limit', async () => {
  const s = await start({ APP_MODE: 'demo', TRUST_PROXY: '1', AI_PARSE_LIMIT_PER_IP_HOUR: '5' })
  const codes = []
  for (let i = 0; i < 7; i++) {
    const r = await req(s, { method: 'POST', url: '/api/ai/parse', headers: { 'X-Forwarded-For': `2001:db8:77:9:${i}::1`, 'Content-Type': 'application/json' } })
    codes.push(r.status)
  }
  assert.deepEqual(codes.slice(0, 5).every((c) => c !== 429), true, 'first five allowed')
  assert.deepEqual(codes.slice(5), [429, 429], 'sixth and seventh blocked although each used a different address')
})

test('different visitors are limited independently', async () => {
  const s = await start({ APP_MODE: 'demo', TRUST_PROXY: '1', AI_PARSE_LIMIT_PER_IP_HOUR: '2' })
  const hit = (ip) => req(s, { method: 'POST', url: '/api/ai/parse', headers: { 'X-Forwarded-For': ip } }).then((r) => r.status)
  await hit('198.51.100.1'); await hit('198.51.100.1')
  assert.equal(await hit('198.51.100.1'), 429)
  assert.notEqual(await hit('198.51.100.2'), 429)
})
