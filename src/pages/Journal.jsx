import { useApp } from '../store.jsx'
import { C, card, label } from '../theme.js'
import { journal as seedJournal } from '../data/seed.js'

const moodStrip = [3, 4, 2, 3, 4, 5, 3, 2, 4, 4, 3, 5, 4, 3].map((v) => ({
  h: v * 9 + 8,
  c: v >= 4 ? 'linear-gradient(180deg,var(--a1),var(--a2))' : v === 3 ? 'rgba(var(--a1-rgb),0.5)' : 'rgba(148,163,184,0.35)',
}))

export default function Journal() {
  const { s } = useApp()
  const entries = s.journalEntries || seedJournal

  return (
    <div style={{ animation: 'rise 0.25s ease-out', maxWidth: 760, margin: '0 auto' }}>
      <h1 style={{ fontWeight: 800, fontSize: 'clamp(24px,3.4vw,32px)', letterSpacing: -1, margin: '0 0 6px' }}>Journal</h1>
      <p style={{ color: C.sub, fontSize: 14, margin: '0 0 20px' }}>One line a night, from Day Close. Mood feeds your Insights.</p>

      <div style={{ ...card, boxShadow: 'none', borderRadius: 20, padding: 20, marginBottom: 20 }}>
        <div style={{ ...label, marginBottom: 14 }}>Mood · last 14 days</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
          {moodStrip.map((m, i) => (
            <div key={i} style={{ flex: 1, height: m.h, background: m.c, borderRadius: '5px 5px 2px 2px' }} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {entries.map((j, i) => (
          <div key={i} className="card-hover" style={{ ...card, boxShadow: 'none', borderRadius: 18, padding: '18px 20px', display: 'flex', gap: 15, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 22, flex: 'none' }}>{j.mood}</span>
            <div>
              <div style={{ color: C.muted, fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>{j.date}</div>
              <div style={{ fontSize: 14, lineHeight: 1.55 }}>{j.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
