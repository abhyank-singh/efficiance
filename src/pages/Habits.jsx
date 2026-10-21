import { useState } from 'react'
import { useApp } from '../store.jsx'
import { C, grad, gradTab, card, label } from '../theme.js'
import { habits as habitDefs, breakHabits as breakDefs } from '../data/seed.js'

const heatCols = ['rgba(0,0,0,0.045)', 'rgba(59,130,246,0.3)', 'rgba(59,130,246,0.55)', 'rgba(16,185,129,0.55)', 'rgba(16,185,129,0.9)']
const gradText = { background: 'linear-gradient(135deg,#2563EB,#0EA478)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }

export default function Habits() {
  const { s, patch } = useApp()
  const [tab, setTab] = useState('build')
  const [noteFor, setNoteFor] = useState(null)
  const [note, setNote] = useState('')

  const toggleHabit = (id) =>
    patch((st) => {
      const cur = st.habitState[id]
      return { habitState: { ...st.habitState, [id]: { done: !cur.done, streak: cur.streak + (cur.done ? -1 : 1) } }, activity: cur.done ? st.activity : [...(st.activity || []), { t: Date.now(), type: 'habit' }].slice(-500) }
    })

  const logSlip = (id) => {
    patch((st) => ({ slips: { ...st.slips, [id]: st.slips[id] + 1 } }))
    setNoteFor(id)
    setNote('')
  }
  const saveNote = () => {
    patch((st) => ({ slipSaved: { ...st.slipSaved, [noteFor]: true } }))
    setNoteFor(null)
  }

  return (
    <div style={{ animation: 'rise 0.25s ease-out' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(24px,3.4vw,32px)', letterSpacing: -1, margin: 0 }}>Habits</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => patch({ roughDay: !s.roughDay })} className="lift" style={{
            background: s.roughDay ? 'linear-gradient(135deg,rgba(245,158,11,0.3),rgba(251,191,36,0.2))' : 'rgba(0,0,0,0.04)',
            border: '1px solid ' + (s.roughDay ? 'rgba(245,158,11,0.5)' : 'rgba(0,0,0,0.09)'),
            color: C.text, padding: '9px 16px', borderRadius: 999, fontWeight: 700, fontSize: 13,
          }}>
            🕯 Rough day mode
          </button>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: 4 }}>
            {['build', 'break'].map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: tab === t ? gradTab : 'transparent', border: 'none', borderRadius: 9,
                padding: '8px 18px', color: C.text, fontWeight: 700, fontSize: 13, textTransform: 'capitalize',
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {s.roughDay && (
        <div style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(251,191,36,0.08))', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 18, padding: '18px 22px', marginBottom: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>Minimum Viable Day 🕯</div>
          <div style={{ color: C.sub, fontSize: 13.5, lineHeight: 1.55 }}>
            Bad days shouldn't kill the system. Today's ask shrinks to 3 tiny wins: <b style={{ color: C.text }}>2 minutes of breathing · 1 page read · 1 glass of water.</b> Everything else is paused, streaks are safe.
          </div>
        </div>
      )}

      {tab === 'build' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
          {habitDefs.map((h) => {
            const st = s.habitState[h.id]
            const heat = Array.from({ length: 28 }, (_, i) => heatCols[(i * 7 + h.seed * 3 + i * i) % 9 % 5])
            return (
              <div key={h.id} className="card-hover" style={{ ...card, padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 16 }}>
                  <button onClick={() => toggleHabit(h.id)} style={{
                    width: 34, height: 34, borderRadius: 11,
                    background: st.done ? grad : 'rgba(0,0,0,0.045)',
                    border: '1.5px solid ' + (st.done ? 'transparent' : 'rgba(0,0,0,0.13)'),
                    color: '#fff', fontSize: 16, fontWeight: 800, flex: 'none',
                    animation: st.done ? 'pop 0.3s ease-out' : 'none',
                  }}>
                    {st.done ? '✓' : ''}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{h.name}</div>
                    <div style={{ color: C.muted, fontSize: 11.5, fontWeight: 600 }}>{h.cat}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.045)', borderRadius: 999, padding: '6px 12px' }}>
                    <span style={{ animation: 'flame 1.6s ease-in-out infinite', display: 'inline-block' }}>🔥</span>
                    <span style={{ fontWeight: 800, fontSize: 14, fontFeatureSettings: "'tnum'" }}>{st.streak}</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14,1fr)', gap: 4 }}>
                  {heat.map((c, i) => (
                    <div key={i} style={{ aspectRatio: 1, borderRadius: 4, background: c }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 11.5, color: C.muted, fontWeight: 600 }}>
                  <span>Last 28 days</span>
                  <span>❄️ 2 streak freezes left</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'break' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
          {breakDefs.map((b) => {
            const cur = s.slips[b.id]
            const trend = b.trend.slice(0, 4).concat([cur])
            const max = Math.max(...trend, b.from)
            const bars = trend.map((v, i) => ({
              h: Math.max(6, Math.round((v / max) * 44)),
              c: i === 4 ? 'linear-gradient(180deg,#2563EB,#12B981)' : 'rgba(148,163,184,0.35)',
              lbl: i === 4 ? 'now' : 'w' + (i + 1),
            }))
            return (
              <div key={b.id} style={{ ...card, padding: 22 }}>
                <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 4 }}>{b.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
                  <span style={{ color: C.muted, fontSize: 13, fontWeight: 600 }}>{b.from}×/wk</span>
                  <span style={{ color: C.muted }}>→</span>
                  <span style={{ fontWeight: 800, fontSize: 20, ...gradText, fontFeatureSettings: "'tnum'" }}>{cur}×/wk</span>
                  <span style={{ color: C.greenDeep, fontSize: 12, fontWeight: 700 }}>↓ trending down</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 56, marginBottom: 8 }}>
                  {bars.map((bar, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, justifyContent: 'flex-end', height: '100%' }}>
                      <div style={{ width: '100%', maxWidth: 34, height: bar.h, background: bar.c, borderRadius: '6px 6px 3px 3px' }} />
                      <span style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>{bar.lbl}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: C.sub, background: 'rgba(0,0,0,0.035)', borderRadius: 10, padding: '9px 12px', marginBottom: 14 }}>
                  🧠 {b.pattern}
                </div>
                <button onClick={() => logSlip(b.id)} style={{
                  width: '100%', background: 'rgba(148,163,184,0.12)', border: '1px solid rgba(148,163,184,0.3)',
                  color: C.sub, padding: 11, borderRadius: 12, fontWeight: 700, fontSize: 13.5,
                }}>
                  Log a slip — it's okay
                </button>
                {noteFor === b.id && (
                  <div style={{ marginTop: 12, animation: 'rise 0.2s ease-out' }}>
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="What led to this? (optional)"
                      autoFocus
                      style={{ width: '100%', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 12, padding: '11px 13px', color: C.text, fontSize: 13 }}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button onClick={saveNote} style={{ flex: 1, background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.45)', color: C.text, padding: 9, borderRadius: 10, fontWeight: 700, fontSize: 12.5 }}>
                        Save note
                      </button>
                      <button onClick={() => setNoteFor(null)} style={{ background: 'none', border: 'none', color: C.muted, fontWeight: 700, fontSize: 12.5, padding: '9px 12px' }}>
                        Skip
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
