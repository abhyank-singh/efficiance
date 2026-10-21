import { useNavigate } from 'react-router-dom'
import { C, grad, card, label } from '../theme.js'
import { PROFILE } from '../config.js'

const tour = [
  { to: '/today', icon: '☀️', title: 'Today', try: 'Read the Morning Briefing, then seal the day with the Day Close ritual at the bottom.', why: 'One screen that answers "what matters today?" by pulling from every module.' },
  { to: '/habits', icon: '✅', title: 'Habits', try: 'Tick a habit and watch the streak. Switch to "Break" and log a slip.', why: 'Bad habits are tracked as a downward trend, not a fragile streak that one slip destroys.' },
  { to: '/finance', icon: '₹', title: 'Finance', try: 'Hit the + button and log a ₹ spend — amount, payee, done.', why: 'Logging a chai should take as long as paying for it, or nobody keeps doing it.' },
  { to: '/gym', icon: '🏋️', title: 'Gym & Health', try: 'Start the workout player, log a set, and beat a personal best.', why: 'A guided player with a rest timer beats a spreadsheet for real gym use.' },
  { to: '/people', icon: '🌱', title: 'People', try: 'Log a check-in and watch that person\'s warmth bar refill.', why: 'Relationships fade quietly. Warmth shows it gently, without guilt badges.' },
  { to: '/insights', icon: '🧠', title: 'Insights  ✨ live AI', try: 'Press "Regenerate with AI" to have a real language model read the sample data.', why: 'The core idea: modules that talk to each other, e.g. "you sleep less on meeting-heavy days".' },
]

const stack = [
  ['Frontend', 'React 18, Vite, React Router. 14 screens, no UI library, custom design system.'],
  ['Backend', 'Node + Express. Only two jobs: relay AI requests and (optionally) read Google Calendar.'],
  ['AI', 'Provider-agnostic: Google Gemini or any OpenAI-compatible API (OpenAI, Groq, OpenRouter, local Ollama). Swap with one env var.'],
  ['Data', 'Local-first. Everything lives in the browser (localStorage) and can be exported as JSON. No database, no login.'],
  ['Hosting', 'Docker on Render. One container serves both the app and the API.'],
]

const decisions = [
  ['Local-first on purpose', 'A life tracker holds sensitive data. Keeping it on the device removes the biggest trust and compliance question and makes the product free to run.'],
  ['AI that can never break the app', 'Insights ship with a saved set. Live generation is a bonus: on timeout, rate limit or error the app quietly keeps the saved set.'],
  ['Cost guardrails', 'Per-visitor rate limits, a daily global cap, size limits on input and output, and a cheap model keep a public demo from running up a bill.'],
  ['Two builds, one codebase', 'The public demo uses fictional data. A private build runs on my own laptop with my real name and calendar.'],
]

const next = ['Real data entry for every module (today the demo modules show sample data)', 'Accounts and a database for sync across devices', 'Bank statement and UPI import', 'Mobile app / installable PWA with reminders']

const btn = { padding: '13px 24px', borderRadius: 14, fontWeight: 800, fontSize: 14.5, border: 'none' }

export default function About() {
  const nav = useNavigate()
  const links = [['GitHub', PROFILE.github], ['LinkedIn', PROFILE.linkedin], ['Email', PROFILE.email && 'mailto:' + PROFILE.email]].filter(([, u]) => u)

  return (
    <div style={{ animation: 'rise 0.25s ease-out', maxWidth: 980, margin: '0 auto' }}>
      <div style={label}>About this project</div>
      <h1 style={{ fontWeight: 800, fontSize: 'clamp(28px,4.4vw,44px)', letterSpacing: -1.5, lineHeight: 1.1, margin: '10px 0 14px' }}>
        Efficiance: a "Life OS" that connects the apps you already use
      </h1>
      <p style={{ color: C.sub, fontSize: 16.5, lineHeight: 1.65, maxWidth: 720, margin: '0 0 22px' }}>
        Most people track their life in six disconnected apps: calendar, habits, budget, fitness, notes and contacts. None of them can notice that you
        <i> sleep less on meeting-heavy days</i> or <i>order food when you skip the gym</i>. Efficiance puts seven modules behind one intelligence layer
        so those patterns surface on their own.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 40 }}>
        <button onClick={() => nav('/today')} className="lift" style={{ ...btn, background: grad, color: '#fff', boxShadow: '0 8px 28px rgba(16,185,129,0.3)' }}>Try the demo →</button>
        {links.map(([name, url]) => (
          <a key={name} href={url} target="_blank" rel="noreferrer" style={{ ...btn, background: '#fff', color: C.text, border: '1px solid rgba(0,0,0,0.1)' }}>{name} ↗</a>
        ))}
      </div>

      <div style={{ ...label, marginBottom: 12 }}>Guided tour · 6 things to try (about 3 minutes)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 14, marginBottom: 44 }}>
        {tour.map((t, i) => (
          <button key={t.to} onClick={() => nav(t.to)} className="card-hover" style={{ ...card, padding: 20, textAlign: 'left', color: C.text, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 15.5 }}>{i + 1}. {t.icon} {t.title}</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.5 }}><b>Try:</b> {t.try}</div>
            <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.5 }}><b>Why it matters:</b> {t.why}</div>
          </button>
        ))}
      </div>

      <div style={{ ...label, marginBottom: 12 }}>How it works</div>
      <div style={{ ...card, padding: 24, marginBottom: 44 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16, alignItems: 'stretch' }}>
          <div style={{ border: '1.5px solid rgba(37,99,235,0.35)', background: 'rgba(37,99,235,0.05)', borderRadius: 16, padding: 18 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>🖥 Your browser</div>
            <div style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.6 }}>React app + <b>all your data</b> (habits, spend, journal…). Nothing is stored on a server, and there is no login.</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: C.muted, fontSize: 12.5, fontWeight: 700, textAlign: 'center', gap: 4 }}>
            <span>only a short text summary,<br />only when you press<br />"Regenerate with AI"</span><span style={{ fontSize: 22 }}>⇄</span>
          </div>
          <div style={{ border: '1.5px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.06)', borderRadius: 16, padding: 18 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>☁️ Small API server</div>
            <div style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.6 }}>Holds the AI key (never sent to your browser), rate-limits each visitor, calls the model, validates the JSON answer, and returns insight cards.</div>
          </div>
        </div>
      </div>

      <div style={{ ...label, marginBottom: 12 }}>Design decisions</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 14, marginBottom: 44 }}>
        {decisions.map(([t, d]) => (
          <div key={t} style={{ ...card, padding: 20 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>{t}</div>
            <div style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.6 }}>{d}</div>
          </div>
        ))}
      </div>

      <div style={{ ...label, marginBottom: 12 }}>Tech stack</div>
      <div style={{ ...card, padding: '6px 22px', marginBottom: 44 }}>
        {stack.map(([k, v], i) => (
          <div key={k} style={{ display: 'flex', gap: 16, padding: '14px 0', borderTop: i ? '1px solid rgba(0,0,0,0.07)' : 'none', flexWrap: 'wrap' }}>
            <div style={{ width: 90, fontWeight: 800, fontSize: 13.5 }}>{k}</div>
            <div style={{ flex: 1, minWidth: 220, fontSize: 13.5, color: C.sub, lineHeight: 1.55 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ ...label, marginBottom: 12 }}>What's next</div>
      <ul style={{ color: C.sub, fontSize: 14, lineHeight: 1.9, margin: '0 0 44px', paddingLeft: 20 }}>
        {next.map((n) => <li key={n}>{n}</li>)}
      </ul>

      <div style={{ ...card, padding: 22, marginBottom: 20 }}>
        <div style={{ fontWeight: 800, marginBottom: 4 }}>Built by {PROFILE.name}</div>
        <div style={{ color: C.sub, fontSize: 13.5, lineHeight: 1.6 }}>
          {PROFILE.tagline}. A side project to learn by shipping. All data in this demo is fictional and lives only in your browser. Use Settings → Export to see exactly what is stored.
        </div>
      </div>
    </div>
  )
}
