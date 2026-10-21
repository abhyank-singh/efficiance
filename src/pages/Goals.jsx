import { useState } from 'react'
import { useApp } from '../store.jsx'
import { C, grad, card, label } from '../theme.js'
import { monthDay } from '../data/dates.js'

const goalDefs = [
  { lane: 'Professional', color: 'var(--a1)', items: [
    { id: 'g1', title: 'Ship Q3 product launch', date: monthDay(83), ms: ['Spec frozen', 'Design handoff', 'Beta with 20 users', 'GA launch'], msDone: [true, true, false, false], linked: 'Linked: 3 calendar blocks/wk' },
    { id: 'g2', title: 'AWS Solutions Architect cert', date: monthDay(129), ms: ['Course modules 1–4', 'Practice exam 70%+', 'Book exam slot'], msDone: [true, false, false], linked: 'Linked habit: Read 20 pages' },
  ] },
  { lane: 'Personal', color: 'var(--a2)', items: [
    { id: 'g3', title: 'Run 10K under 60 min', date: monthDay(46), ms: ['5K under 30 min', '8K long run', 'Race registration'], msDone: [true, true, false], linked: 'Linked: Sunday long runs' },
    { id: 'g4', title: '₹3L emergency fund', date: monthDay(175), ms: ['₹1L saved', '₹2L saved', '₹3L saved'], msDone: [true, false, false], linked: 'Linked: SIP tracker' },
  ] },
  { lane: 'Growth · Learning', color: 'var(--ok)', items: [
    { id: 'g5', title: 'Deep Work — Cal Newport', date: monthDay(22), ms: ['Part I', 'Part II', 'Part III'], msDone: [true, true, false], linked: '📖 Book · 62% read', learning: true, cta: 'Continue: Ch. 7, p. 214' },
    { id: 'g6', title: 'System Design course', date: monthDay(93), ms: ['Fundamentals', 'Case studies', 'Mock interviews'], msDone: [true, false, false], linked: '🎓 Course · 30% complete', learning: true, cta: 'Continue: Module 5' },
  ] },
]

const confetti = Array.from({ length: 36 }, (_, i) => ({
  left: i * 2.77 + '%',
  width: 6 + (i % 3) * 3,
  height: 10 + (i % 4) * 3,
  background: ['var(--a1)', 'var(--a2)', '#FF5A5F'][i % 3],
  animation: `confall ${2.4 + (i % 5) * 0.4}s linear ${(i % 7) * 0.18}s infinite`,
}))

export default function Goals() {
  const { s, patch } = useApp()
  const [party, setParty] = useState(false)

  const msState = (g, i) => (s.milestones[g.id + i] != null ? s.milestones[g.id + i] : g.msDone[i])

  const toggleMs = (g, i) => {
    const next = !msState(g, i)
    const nm = { ...s.milestones, [g.id + i]: next }
    patch({ milestones: nm })
    const allDone = g.msDone.every((d, j) => (nm[g.id + j] != null ? nm[g.id + j] : d))
    if (allDone) setParty(true)
  }

  return (
    <div style={{ animation: 'rise 0.25s ease-out' }}>
      <h1 style={{ fontWeight: 800, fontSize: 'clamp(24px,3.4vw,32px)', letterSpacing: -1, margin: '0 0 22px' }}>Goals</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18, alignItems: 'start' }}>
        {goalDefs.map((lane) => (
          <div key={lane.lane}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: lane.color }} />
              <span style={{ ...label, color: C.sub }}>{lane.lane}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {lane.items.map((g) => {
                const done = g.ms.map((_, i) => msState(g, i))
                const pct = Math.round((done.filter(Boolean).length / done.length) * 100)
                const dash = Math.round(201 * (1 - pct / 100))
                return (
                  <div key={g.id} className="card-hover" style={{ ...card, padding: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.35 }}>{g.title}</div>
                        <div style={{ color: C.muted, fontSize: 12, marginTop: 5, fontWeight: 600 }}>Target: {g.date}</div>
                      </div>
                      <div style={{ position: 'relative', width: 58, height: 58, flex: 'none' }}>
                        <svg width="58" height="58" viewBox="0 0 76 76">
                          <circle cx="38" cy="38" r="32" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="8" />
                          <circle cx="38" cy="38" r="32" fill="none" stroke="url(#eg)" strokeWidth="8" strokeLinecap="round" strokeDasharray="201" strokeDashoffset={dash} transform="rotate(-90 38 38)" style={{ animation: 'ringin 0.8s ease-out' }} />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, fontFeatureSettings: "'tnum'" }}>{pct}%</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, margin: '14px 0' }}>
                      {g.ms.map((m, i) => {
                        const isDone = done[i]
                        return (
                          <button key={m} onClick={() => toggleMs(g, i)} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', padding: '2px 0', textAlign: 'left' }}>
                            <span style={{
                              width: 19, height: 19, borderRadius: 7,
                              background: isDone ? grad : 'rgba(0,0,0,0.05)',
                              border: '1.5px solid ' + (isDone ? 'transparent' : 'rgba(0,0,0,0.13)'),
                              color: '#fff', fontSize: 11, fontWeight: 800,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
                            }}>
                              {isDone ? '✓' : ''}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: isDone ? C.sub : C.text, textDecoration: isDone ? 'line-through' : 'none' }}>{m}</span>
                          </button>
                        )
                      })}
                    </div>

                    <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.05)' }}>{g.linked}</div>
                    {g.learning && (
                      <button className="bd-hover-teal" style={{ marginTop: 12, width: '100%', background: 'rgba(var(--a1-rgb),0.14)', border: '1px solid rgba(var(--a1-rgb),0.4)', color: C.text, padding: 10, borderRadius: 12, fontWeight: 700, fontSize: 13 }}>
                        ▶ {g.cta}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.085)', borderTopColor: 'rgba(0,0,0,0.05)', borderRadius: 22, padding: 22, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: 64, height: 64, flex: 'none' }}>
          <svg width="64" height="64" viewBox="0 0 76 76">
            <circle cx="38" cy="38" r="32" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="8" />
            <circle cx="38" cy="38" r="32" fill="none" stroke="url(#eg)" strokeWidth="8" strokeLinecap="round" strokeDasharray="201" strokeDashoffset="50" transform="rotate(-90 38 38)" style={{ animation: 'ringin 0.8s ease-out' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>75%</div>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, fontFeatureSettings: "'tnum'" }}>4.5h of 6h weekly learning target</div>
          <div style={{ color: C.sub, fontSize: 13, marginTop: 3 }}>You learn most consistently in Tuesday free blocks — 1.5h to go this week.</div>
        </div>
      </div>

      {party && (
        <>
          {confetti.map((c, i) => (
            <div key={i} style={{ position: 'fixed', zIndex: 60, top: -20, left: c.left, width: c.width, height: c.height, borderRadius: 2, background: c.background, animation: c.animation, pointerEvents: 'none' }} />
          ))}
          <div onClick={() => setParty(false)} style={{ position: 'fixed', inset: 0, zIndex: 59, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(17,24,39,0.3)', backdropFilter: 'blur(6px)', cursor: 'pointer' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid rgba(255,90,95,0.4)', borderRadius: 26, padding: '44px 54px', textAlign: 'center', boxShadow: '0 20px 60px rgba(255,90,95,0.18),0 2px 8px rgba(16,24,40,0.08)', animation: 'glowpulse 2s ease-in-out infinite' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🎉</div>
              <div style={{ fontWeight: 800, fontSize: 24 }}>Goal completed!</div>
              <div style={{ color: C.sub, fontSize: 14, marginTop: 8 }}>Every milestone checked. This is what one life, well-run, looks like.</div>
              <div style={{ marginTop: 18, color: C.greenDeep, fontWeight: 700, fontSize: 13 }}>Tap anywhere to continue</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
