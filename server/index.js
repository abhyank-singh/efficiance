import app from './app.js'
import { isDemo } from './limits.js'

// Long-running server entry (Docker / Render / Railway / local `npm start`).
// Honors SERVER_PORT (local dev) then the host-provided PORT, else 3001.
const PORT = process.env.SERVER_PORT || process.env.PORT || 3001

// The personal build holds your Google Calendar token and has no login, so it must only be reachable from
// this machine: bind loopback by default. The public demo (Render) and Docker images set HOST=0.0.0.0.
const HOST = process.env.HOST || (isDemo() ? '0.0.0.0' : '127.0.0.1')

app.listen(PORT, HOST, () => {
  console.log(`Efficiance server listening on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}${HOST === '0.0.0.0' ? ' (all interfaces)' : ''}`)
  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY && process.env.AI_PROVIDER !== 'openai') {
    console.log('Note: no AI key set. Insights will use the saved set until you add one to .env')
  }
})
