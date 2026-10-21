import { useNavigate } from 'react-router-dom'
import { useApp, fmtINR } from '../store.jsx'
import { C, grad, card, label, pillBtn } from '../theme.js'
import { habits as habitDefs, journal as seedJournal } from '../data/seed.js'
import { getDayBlocks, getDueList, topGoals, MOODS } from '../data/derived.js'
import { shortDay, longDay } from '../data/dates.js'
import { DEFAULT_NAME } from '../config.js'

const summaryCard = { ...card, padding: 22 }

function CardHeader({ title, action, onAction }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={label}>{title}</div>
      {action && (
        <button onClick={onAction} style={{ background: 'none', border: 'none', color: C.blue, fontSize: 12, fontWeight: 700 }}>{action}</button>
      )}
    </div>
  )
}

export default function Today() {
  const { s, patch } = useApp()
  const nav = useNavigate()
  const userName = (s.name || '').trim() || DEFAULT_NAME
  const evening = s.evening

  const habits = habitDefs.map((h) => ({ ...h, ...s.habitState[h.id] }))
  const remaining = habits.filter((h) => !h.done)
  const toggleHabit = (id) =>
    patch((st) => {
      const cur = st.habitState[id]
      return { habitState: { ...st.habitState, [id]: { done: !cur.done, streak: cur.streak + (cur.done ? -1 : 1) } } }
    })

  const todayEvents = getDayBlocks(s.blockTaken).filter((b) => b.isEvent).map((b) => ({ time: b.time.split(' – ')[0], title: b.title, col: b.col, bg: b.bg }))
  const dueList = getDueList(s.peopleLogged)
  const todaySpent = fmtINR(s.txToday.reduce((a, t) => a + t.a, 0))

  const claimBlock = () => { patch({ blockTaken: true, workoutOn: true }); nav('/gym') }
  const startWorkout = () => { patch({ workoutOn: true }); nav('/gym') }

  const seal = () =>
    patch((st) => {
      const entries = st.journalEntries || seedJournal
      const line = st.journalLine.trim()
      return {
        sealed: true,
        journalEntries: line
          ? [{ date: shortDay(0), mood: st.mood || '🙂', text: line }, ...entries.filter((e) => e.date !== shortDay(0))]
          : entries,
      }
    })

  return (
    <div style={{ animation: 'rise 0.25s ease-out' }}>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <div style={label}>{longDay(0)}</div>
          <h1 style={{ fontWeight: 800, fontSize: 'clamp(24px,3.4vw,32px)', letterSpacing: -1, margin: '8px 0 0' }}>
            {evening ? 'Good evening' : 'Good morning'}, {userName}
          </h1>
        </div>
        <button onClick={() => patch({ evening: !evening })} className="bd-hover text-hover-dark" style={{ background: 'rgba(0,0,0,0.045)', border: '1px solid rgba(0,0,0,0.09)', color: C.sub, padding: '10px 16px', borderRadius: 12, fontWeight: 700, fontSize: 13 }}>
          {evening ? '☀️ Back to morning' : '🌙 Preview Day Close'}
        </button>
      </div>

      {!evening && (
        <div style={{ ...card, borderRadius: 24, padding: 'clamp(22px,3vw,32px)', marginBottom: 20 }}>
          <div style={{ ...label, marginBottom: 12 }}>☀️ Morning Briefing</div>
          <div style={{ fontSize: 'clamp(17px,2.4vw,22px)', fontWeight: 600, lineHeight: 1.55 }}>
            Good morning, {userName}. <span style={{ color: C.blue }}>3 meetings</span> today with a <span style={{ color: C.greenDeep }}>2-hour free block at 3 PM</span> — perfect for your scheduled Leg Day. Mom's birthday is <span style={{ color: C.greenDeep }}>in 2 days 🎂</span>. You're <span style={{ color: C.amber }}>₹800 over</span> your food budget this week. You slept <span style={{ color: C.sub }}>6h 10m</span> — consider an earlier night.
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
            <button onClick={claimBlock} className="lift" style={{ background: grad, border: 'none', color: '#fff', padding: '10px 18px', borderRadius: 999, fontWeight: 800, fontSize: 13 }}>
              🏋️ Claim 3 PM for Leg Day
            </button>
            <button onClick={() => nav('/people')} className="bd-hover" style={pillBtn}>🎂 Plan Mom's gift</button>
            <button onClick={() => nav('/finance')} style={{ ...pillBtn, border: '1px solid rgba(245,158,11,0.4)', color: C.amber }}>₹ Review food budget</button>
          </div>
        </div>
      )}

      {evening && (
        <div style={{
          ...card, border: '1px solid rgba(34,211,174,0.28)', borderTopColor: 'rgba(0,0,0,0.05)', borderRadius: 24,
          padding: 'clamp(22px,3vw,32px)', marginBottom: 20,
          animation: s.sealed ? 'glowpulse 2.4s ease-in-out infinite' : 'none',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={label}>🌙 Day Close · 60-second ritual</div>
            {s.sealed && <div style={{ color: C.greenDeep, fontWeight: 800, fontSize: 13 }}>Day sealed ✨</div>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 18 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: C.sub }}>Remaining habits ({remaining.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {remaining.map((h) => (
                  <button key={h.id} onClick={() => toggleHabit(h.id)} className="bd-hover-teal" style={{
                    display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,0.035)',
                    border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: '10px 12px',
                    color: C.text, fontSize: 13, fontWeight: 600, textAlign: 'left',
                  }}>
                    <span style={{ width: 20, height: 20, borderRadius: 7, border: '1.5px solid rgba(0,0,0,0.2)', flex: 'none' }} />
                    {h.name}
                  </button>
                ))}
                {remaining.length === 0 && <div style={{ color: C.greenDeep, fontSize: 13, fontWeight: 700 }}>All habits done 🎉</div>}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: C.sub }}>One line about today</div>
              <textarea
                value={s.journalLine}
                onChange={(e) => patch({ journalLine: e.target.value })}
                placeholder="What happened today?"
                style={{ width: '100%', height: 64, background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 12, padding: 12, color: C.text, fontSize: 13.5, resize: 'none' }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {MOODS.map((e) => (
                  <button key={e} onClick={() => patch({ mood: e })} className="scale-hover-lg" style={{
                    background: s.mood === e ? 'linear-gradient(135deg,rgba(59,130,246,0.4),rgba(16,185,129,0.4))' : 'rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '8px 10px', fontSize: 18,
                  }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: C.sub }}>Tomorrow's #1 priority</div>
              <input
                value={s.priority}
                onChange={(e) => patch({ priority: e.target.value })}
                placeholder="One thing that matters most"
                style={{ width: '100%', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 12, padding: 12, color: C.text, fontSize: 13.5 }}
              />
              <button onClick={seal} className="lift" style={{ marginTop: 12, width: '100%', background: grad, border: 'none', color: '#fff', padding: 12, borderRadius: 12, fontWeight: 800, fontSize: 14 }}>
                Seal the day ✨
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18 }}>

        <div className="card-hover" style={summaryCard}>
          <CardHeader title="Today's schedule" action="Open →" onAction={() => nav('/calendar')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {todayEvents.map((e) => (
              <div key={e.time + e.title} style={{ display: 'flex', alignItems: 'center', gap: 10, background: e.bg, borderLeft: '3px solid ' + e.col, borderRadius: 10, padding: '9px 12px' }}>
                <span style={{ fontFeatureSettings: "'tnum'", fontWeight: 800, fontSize: 12.5, color: e.col, width: 44, flex: 'none' }}>{e.time}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{e.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-hover" style={summaryCard}>
          <CardHeader title="Top goals" action="All →" onAction={() => nav('/goals')} />
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: 8 }}>
            {topGoals.map((g) => (
              <div key={g.name} style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto' }}>
                  <svg width="72" height="72" viewBox="0 0 76 76">
                    <circle cx="38" cy="38" r="32" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="7" />
                    <circle cx="38" cy="38" r="32" fill="none" stroke="url(#eg)" strokeWidth="7" strokeLinecap="round" strokeDasharray="201" strokeDashoffset={g.dash} transform="rotate(-90 38 38)" style={{ animation: 'ringin 0.8s ease-out' }} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, fontFeatureSettings: "'tnum'" }}>{g.pct}</div>
                </div>
                <div style={{ fontSize: 11.5, color: C.sub, fontWeight: 600, marginTop: 8 }}>{g.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-hover" style={summaryCard}>
          <CardHeader title="Habits" action="All →" onAction={() => nav('/habits')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {habits.map((h) => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <button role="checkbox" aria-checked={h.done} aria-label={h.name} onClick={() => toggleHabit(h.id)} style={{
                  width: 26, height: 26, borderRadius: 9,
                  background: h.done ? grad : 'rgba(0,0,0,0.045)',
                  border: '1.5px solid ' + (h.done ? 'transparent' : 'rgba(0,0,0,0.13)'),
                  color: '#fff', fontSize: 13, fontWeight: 800, flex: 'none',
                  animation: h.done ? 'pop 0.3s ease-out' : 'none',
                }}>
                  {h.done ? '✓' : ''}
                </button>
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{h.name}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12.5, fontWeight: 800, color: C.sub }}>
                  <span style={{ animation: 'flame 1.6s ease-in-out infinite', display: 'inline-block', fontSize: 13 }}>🔥</span>{h.streak}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-hover" style={summaryCard}>
          <CardHeader title="This week's spend" action="Open →" onAction={() => nav('/finance')} />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontWeight: 800, fontSize: 26, fontFeatureSettings: "'tnum'" }}>₹14,250</span>
            <span style={{ color: C.sub, fontSize: 13 }}>of ₹27,000</span>
          </div>
          <div style={{ height: 10, background: 'rgba(0,0,0,0.05)', borderRadius: 6, margin: '12px 0', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '53%', background: 'linear-gradient(90deg,#2563EB,#12B981)', borderRadius: 6 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
            <span style={{ color: C.sub }}>Today so far</span>
            <span style={{ fontWeight: 800, fontFeatureSettings: "'tnum'" }}>{todaySpent}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginTop: 6 }}>
            <span style={{ color: C.sub }}>Food budget</span>
            <span style={{ fontWeight: 800, color: C.amber }}>₹800 over</span>
          </div>
        </div>

        <div className="card-hover" style={summaryCard}>
          <div style={{ ...label, marginBottom: 14 }}>Next workout</div>
          <div style={{ fontWeight: 700, fontSize: 19 }}>🦵 Leg Day</div>
          <div style={{ color: C.sub, fontSize: 13, margin: '6px 0 16px' }}>5 exercises · ~65 min · fits your 3 PM free block</div>
          <button onClick={startWorkout} className="lift" style={{ width: '100%', background: grad, border: 'none', color: '#fff', padding: 12, borderRadius: 12, fontWeight: 800, fontSize: 14 }}>
            Start workout →
          </button>
        </div>

        <div className="card-hover" style={summaryCard}>
          <CardHeader title="People" action="Open →" onAction={() => nav('/people')} />
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>{dueList.length} check-ins due 🌱</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {dueList.map((p) => (
              <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>{p.name}</span>
                <span style={{ color: C.muted, fontSize: 12 }}>{p.group}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.07)', fontSize: 13, color: C.greenDeep, fontWeight: 700 }}>
            🎂 Mom's birthday in 2 days
          </div>
        </div>

        <div className="card-hover" style={{
          gridColumn: '1/-1', background: 'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(16,185,129,0.12))',
          border: '1px solid rgba(34,211,174,0.3)', borderRadius: 22,
          boxShadow: '0 1px 2px rgba(16,24,40,0.05),0 10px 30px rgba(16,24,40,0.08)', padding: 22,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 22 }}>🧠</span>
            <div>
              <div style={{ ...label, marginBottom: 4 }}>Insight of the day</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Your workout completion is 2× higher when scheduled before 8 AM.</div>
            </div>
          </div>
          <button onClick={() => nav('/insights')} className="bd-hover-dark" style={{ background: 'rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.1)', color: C.text, padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: 13, flex: 'none' }}>
            All insights →
          </button>
        </div>

      </div>
    </div>
  )
}
