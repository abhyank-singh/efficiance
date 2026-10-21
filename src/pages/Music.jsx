import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../store.jsx'
import { C, grad, card, label } from '../theme.js'
import { instruments, guitarPlan, practiceSeed, songs, chords, tuning, DAILY_GOAL_MIN } from '../data/music.js'
import { weekday } from '../data/dates.js'
import { todayKey } from '../data/actions.js'
import { useMetronome, playTone } from '../audio.js'
import { track } from '../track.js'

/* ───────────── practice maths (shared by the panel) ───────────── */

function usePractice() {
  const { s, patch, log } = useApp()
  const p = s.practice
  const today = todayKey()
  const minToday = p.log.filter((e) => e.date === today).reduce((a, e) => a + e.min, 0)
  // last 7 days: 6 sample days + today (live)
  const week = practiceSeed.map((m, i) => ({ label: weekday(i - 6), min: m })).concat([{ label: 'Today', min: minToday }])
  const weekTotal = week.reduce((a, d) => a + d.min, 0)
  let streak = 0
  for (let i = week.length - 1; i >= 0; i--) {
    if (week[i].min > 0) streak++
    else if (i === week.length - 1) continue // today not practised yet: don't break the streak
    else break
  }
  const addLog = (entry) => {
    patch((st) => ({ practice: { ...st.practice, log: st.practice.log.concat([{ date: todayKey(), ...entry }]) } }))
    log('practice')
    track('music_practice_logged')
  }
  return { s, patch, p, today, minToday, week, weekTotal, streak, addLog }
}

/* ───────────── small pieces ───────────── */

const Section = ({ title, hint, children, style }) => (
  <div style={{ ...card, borderRadius: 22, padding: 'clamp(18px,2.4vw,26px)', ...style }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
      <div style={label}>{title}</div>
      {hint && <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{hint}</div>}
    </div>
    {children}
  </div>
)

const pill = (on) => ({
  background: on ? 'linear-gradient(135deg,rgba(59,130,246,0.35),rgba(16,185,129,0.35))' : 'rgba(0,0,0,0.045)',
  border: '1px solid ' + (on ? 'rgba(34,211,174,0.6)' : 'rgba(0,0,0,0.09)'), color: C.text,
  padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700,
})

function ChordDiagram({ chord, size = 1 }) {
  const xs = [0, 1, 2, 3, 4, 5].map((i) => 18 + i * 16)
  const y0 = 30
  const fh = 20
  return (
    <svg width={116 * size} height={136 * size} viewBox="0 0 116 136" role="img" aria-label={`${chord.name} chord diagram`}>
      <text x="58" y="12" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.text}>{chord.name}</text>
      <line x1={xs[0]} x2={xs[5]} y1={y0} y2={y0} stroke={C.text} strokeWidth="4" strokeLinecap="round" />
      {[1, 2, 3, 4].map((f) => <line key={f} x1={xs[0]} x2={xs[5]} y1={y0 + f * fh} y2={y0 + f * fh} stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" />)}
      {xs.map((x, i) => <line key={i} x1={x} x2={x} y1={y0} y2={y0 + 4 * fh} stroke="rgba(0,0,0,0.35)" strokeWidth="1.2" />)}
      {chord.barre && <rect x={xs[0] - 5} y={y0 + (chord.barre - 0.5) * fh - 6} width={xs[5] - xs[0] + 10} height="12" rx="6" fill="url(#eg)" />}
      {chord.frets.map((f, i) => f === -1
        ? <text key={i} x={xs[i]} y={y0 - 7} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.muted}>×</text>
        : f === 0
          ? <circle key={i} cx={xs[i]} cy={y0 - 10} r="3.6" fill="none" stroke={C.sub} strokeWidth="1.4" />
          : (
            <g key={i}>
              <circle cx={xs[i]} cy={y0 + (f - 0.5) * fh} r="7.5" fill="url(#eg)" />
              {chord.fingers?.[i] ? <text x={xs[i]} y={y0 + (f - 0.5) * fh + 3.6} textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff">{chord.fingers[i]}</text> : null}
            </g>
          ))}
    </svg>
  )
}

/* ───────────── guitar panel ───────────── */

function Overview({ pr }) {
  const { week, weekTotal, streak, minToday } = pr
  const pct = Math.min(1, minToday / DAILY_GOAL_MIN)
  const max = Math.max(DAILY_GOAL_MIN, ...week.map((d) => d.min))
  return (
    <Section title="This week" hint={`Goal: ${DAILY_GOAL_MIN} min a day`}>
      <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: 104, height: 104, flex: 'none' }}>
          <svg width="104" height="104" viewBox="0 0 76 76">
            <circle cx="38" cy="38" r="32" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="8" />
            <circle cx="38" cy="38" r="32" fill="none" stroke="url(#eg)" strokeWidth="8" strokeLinecap="round" strokeDasharray="201" strokeDashoffset={201 * (1 - pct)} transform="rotate(-90 38 38)" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 20, fontFeatureSettings: "'tnum'" }}>{minToday}</div>
            <div style={{ fontSize: 10.5, color: C.sub, fontWeight: 700 }}>min today</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap' }}>
          <div><div style={{ fontWeight: 800, fontSize: 26 }}>🔥 {streak}</div><div style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>day streak</div></div>
          <div><div style={{ fontWeight: 800, fontSize: 26, fontFeatureSettings: "'tnum'" }}>{weekTotal}</div><div style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>minutes this week</div></div>
        </div>
        <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'flex-end', gap: 8, height: 92 }} aria-label="Minutes practised per day">
          {week.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div title={`${d.min} min`} style={{ width: '100%', height: Math.max(4, (d.min / max) * 62), borderRadius: '6px 6px 3px 3px', background: d.min >= DAILY_GOAL_MIN ? 'linear-gradient(180deg,#2563EB,#12B981)' : d.min > 0 ? 'rgba(59,130,246,0.5)' : 'rgba(148,163,184,0.3)', transition: 'height 0.4s ease' }} />
              <div style={{ fontSize: 10.5, color: C.muted, fontWeight: 700 }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

function Plan({ pr }) {
  const { p, patch, today, addLog } = pr
  const done = p.plan?.[today] || {}
  const total = guitarPlan.reduce((a, b) => a + b.min, 0)
  const doneMin = guitarPlan.filter((b) => done[b.id]).reduce((a, b) => a + b.min, 0)
  const toggle = (b) => {
    if (!done[b.id]) {
      patch((st) => ({ practice: { ...st.practice, plan: { ...st.practice.plan, [today]: { ...(st.practice.plan?.[today] || {}), [b.id]: true } } } }))
      addLog({ min: b.min, topic: b.title, src: 'plan:' + b.id })
    } else {
      patch((st) => ({ practice: { ...st.practice, plan: { ...st.practice.plan, [today]: { ...(st.practice.plan?.[today] || {}), [b.id]: false } }, log: st.practice.log.filter((e) => !(e.date === today && e.src === 'plan:' + b.id)) } }))
    }
  }
  return (
    <Section title="Today’s practice plan" hint={`${doneMin} / ${total} min`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {guitarPlan.map((b) => (
          <button key={b.id} onClick={() => toggle(b)} role="checkbox" aria-checked={!!done[b.id]} className="bd-hover-teal" style={{
            display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', borderRadius: 16, padding: '13px 15px',
            background: done[b.id] ? 'rgba(16,185,129,0.08)' : 'rgba(0,0,0,0.03)', border: '1px solid ' + (done[b.id] ? 'rgba(16,185,129,0.35)' : 'rgba(0,0,0,0.07)'), color: C.text,
          }}>
            <span style={{ width: 26, height: 26, borderRadius: 9, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done[b.id] ? grad : 'rgba(0,0,0,0.05)', border: done[b.id] ? 'none' : '1.5px solid rgba(0,0,0,0.13)', color: '#fff', fontWeight: 800, fontSize: 13 }}>{done[b.id] ? '✓' : ''}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 14 }}>{b.icon} {b.title}</span>
              <span style={{ display: 'block', fontSize: 12.5, color: C.sub, marginTop: 2 }}>{b.tip}</span>
            </span>
            <span style={{ fontWeight: 800, fontSize: 13, color: C.sub, flex: 'none' }}>{b.min} min</span>
          </button>
        ))}
      </div>
    </Section>
  )
}

function SessionTimer({ pr }) {
  const [start, setStart] = useState(null)
  const [now, setNow] = useState(0)
  useEffect(() => {
    if (!start) return undefined
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [start])
  const secs = start ? Math.max(0, Math.floor(((now || Date.now()) - start) / 1000)) : 0
  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')
  const stop = () => {
    const minutes = Math.max(1, Math.round(secs / 60))
    pr.addLog({ min: minutes, topic: 'Free play', src: 'timer' })
    setStart(null)
  }
  return (
    <Section title="Free-play timer" hint="Logs your time when you stop">
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: -1, fontFeatureSettings: "'tnum'" }} aria-live="off">{mm}:{ss}</div>
        {start
          ? <button onClick={stop} className="lift" style={{ background: '#16181D', border: 'none', color: '#fff', padding: '12px 22px', borderRadius: 14, fontWeight: 800 }}>Stop &amp; log</button>
          : <button onClick={() => { setStart(Date.now()); setNow(Date.now()) }} className="lift" style={{ background: grad, border: 'none', color: '#fff', padding: '12px 22px', borderRadius: 14, fontWeight: 800 }}>▶ Start session</button>}
      </div>
    </Section>
  )
}

const tempoName = (b) => (b < 60 ? 'Largo' : b < 76 ? 'Adagio' : b < 108 ? 'Andante' : b < 120 ? 'Moderato' : b < 156 ? 'Allegro' : 'Presto')

function Metronome() {
  const [bpm, setBpm] = useState(80)
  const [bar, setBar] = useState(4)
  const [taps, setTaps] = useState([])
  const m = useMetronome(bpm, bar)
  const clamp = (v) => Math.max(40, Math.min(220, v))
  const tap = () => {
    const t = Date.now()
    const next = [...taps.filter((x) => t - x < 2500), t].slice(-5)
    setTaps(next)
    if (next.length >= 2) {
      const avg = (next[next.length - 1] - next[0]) / (next.length - 1)
      setBpm(clamp(Math.round(60000 / avg)))
    }
  }
  const btn = { background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 12, width: 44, height: 44, fontSize: 20, fontWeight: 700, color: C.text }
  return (
    <Section title="Metronome" hint="Steady click, even if the page is busy">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
        <button style={btn} aria-label="Slower" onClick={() => setBpm((b) => clamp(b - 1))}>−</button>
        <div style={{ textAlign: 'center', minWidth: 96 }}>
          <div style={{ fontWeight: 800, fontSize: 40, lineHeight: 1, fontFeatureSettings: "'tnum'" }}>{bpm}</div>
          <div style={{ fontSize: 11.5, color: C.sub, fontWeight: 700 }}>BPM · {tempoName(bpm)}</div>
        </div>
        <button style={btn} aria-label="Faster" onClick={() => setBpm((b) => clamp(b + 1))}>+</button>
        <button onClick={tap} className="lift" style={{ ...pill(false), padding: '11px 16px' }}>Tap tempo</button>
        <button onClick={() => { m.toggle(); track('music_metronome') }} className="lift" aria-pressed={m.running} style={{ background: m.running ? '#16181D' : grad, border: 'none', color: '#fff', padding: '12px 22px', borderRadius: 14, fontWeight: 800 }}>
          {m.running ? '■ Stop' : '▶ Start'}
        </button>
      </div>
      <input type="range" min="40" max="220" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} aria-label="Tempo" style={{ width: '100%', accentColor: '#2563EB' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginTop: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }} aria-label="Beat indicator">
          {Array.from({ length: bar }, (_, i) => (
            <div key={i} style={{ width: 20, height: 20, borderRadius: '50%', transition: 'transform 0.08s, background 0.08s', transform: m.beat === i ? 'scale(1.35)' : 'none', background: m.beat === i ? (i === 0 ? '#2563EB' : '#12B981') : 'rgba(0,0,0,0.1)' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[2, 3, 4, 6].map((n) => <button key={n} onClick={() => setBar(n)} style={pill(bar === n)} aria-pressed={bar === n}>{n}/4</button>)}
        </div>
      </div>
    </Section>
  )
}

function ChordLab({ pr }) {
  const { p, patch } = pr
  const [name, setName] = useState('G')
  const [pair, setPair] = useState(['G', 'C'])
  const [secs, setSecs] = useState(null) // null = not running
  const [count, setCount] = useState(0)
  const chord = chords.find((c) => c.name === name)
  const [a, b] = pair.map((n) => chords.find((c) => c.name === n))

  useEffect(() => {
    if (secs === null) return undefined
    if (secs <= 0) {
      patch((st) => ({ practice: { ...st.practice, bestCpm: Math.max(st.practice.bestCpm || 0, count) } }))
      track('music_drill_done')
      return undefined
    }
    const t = setTimeout(() => setSecs((x) => x - 1), 1000)
    return () => clearTimeout(t)
  }, [secs])

  const shuffle = () => {
    const pool = chords.map((c) => c.name)
    const x = pool[Math.floor(Math.random() * pool.length)]
    let y = x
    while (y === x) y = pool[Math.floor(Math.random() * pool.length)]
    setPair([x, y]); setSecs(null); setCount(0)
  }
  const running = secs !== null && secs > 0
  return (
    <>
      <Section title="Chord library" hint="Tap a chord. Numbers are finger positions.">
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 18, padding: '8px 14px', flex: 'none' }}><ChordDiagram chord={chord} size={1.25} /></div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1, minWidth: 220 }}>
            {chords.map((c) => <button key={c.name} onClick={() => setName(c.name)} aria-pressed={name === c.name} style={{ ...pill(name === c.name), minWidth: 52 }}>{c.name}</button>)}
          </div>
        </div>
      </Section>

      <Section title="Chord-change drill" hint={p.bestCpm ? `Best: ${p.bestCpm} changes / min` : 'How many clean changes in 60 seconds?'}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.03)', borderRadius: 18, padding: '6px 10px' }}>
            <ChordDiagram chord={a} /><span style={{ fontSize: 20, color: C.muted }}>⇄</span><ChordDiagram chord={b} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ fontWeight: 800, fontSize: 30, fontFeatureSettings: "'tnum'" }}>{secs === null ? '60' : Math.max(0, secs)}s · <span style={{ color: C.greenDeep }}>{count}</span> changes</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {!running && <button onClick={() => { setCount(0); setSecs(60) }} className="lift" style={{ background: grad, border: 'none', color: '#fff', padding: '11px 18px', borderRadius: 14, fontWeight: 800 }}>{secs === 0 ? '↻ Again' : '▶ Start 60s'}</button>}
              {running && <button onClick={() => setCount((n) => n + 1)} className="lift" style={{ background: '#16181D', border: 'none', color: '#fff', padding: '14px 26px', borderRadius: 14, fontWeight: 800, fontSize: 16 }}>Changed! +1</button>}
              <button onClick={shuffle} style={pill(false)}>🔀 New pair</button>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}

function Tuning() {
  const [last, setLast] = useState('')
  return (
    <Section title="Tuning reference" hint="Standard tuning. Tap to hear each string, then match it.">
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {tuning.map((t) => (
          <button key={t.s + t.oct} onClick={() => { playTone(t.hz); setLast(t.s + t.oct) }} className="lift" aria-label={`Play ${t.s}${t.oct}`} style={{ ...pill(last === t.s + t.oct), padding: '12px 0', width: 62, textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{t.s}</div>
            <div style={{ fontSize: 10.5, color: C.sub, fontWeight: 700 }}>{t.hz} Hz</div>
          </button>
        ))}
      </div>
    </Section>
  )
}

function Songs({ pr }) {
  const { p, patch } = pr
  const bump = (id) => { patch((st) => ({ practice: { ...st.practice, songs: { ...st.practice.songs, [id]: (st.practice.songs?.[id] || 0) + 10 } } })); track('music_song_progress') }
  return (
    <Section title="Repertoire" hint="Your songs, one next step each">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {songs.map((sg) => {
          const pct = Math.min(100, sg.base + (p.songs?.[sg.id] || 0))
          return (
            <div key={sg.id} style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 14, fontWeight: 700 }}><span>{sg.title}</span><span style={{ color: C.sub, fontFeatureSettings: "'tnum'" }}>{pct}%</span></div>
                <div style={{ height: 7, borderRadius: 4, background: 'rgba(0,0,0,0.07)', margin: '7px 0 5px', overflow: 'hidden' }}><div style={{ width: pct + '%', height: '100%', background: grad, borderRadius: 4, transition: 'width 0.5s ease' }} /></div>
                <div style={{ fontSize: 12, color: C.sub }}>{sg.level} · Next: {sg.next}</div>
              </div>
              <button onClick={() => bump(sg.id)} disabled={pct >= 100} style={{ ...pill(false), opacity: pct >= 100 ? 0.45 : 1 }}>+10% ✓</button>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

function GuitarPanel() {
  const pr = usePractice()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Overview pr={pr} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 18, alignItems: 'start' }}>
        <Plan pr={pr} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}><SessionTimer pr={pr} /><Metronome /></div>
      </div>
      <ChordLab pr={pr} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 18, alignItems: 'start' }}>
        <Tuning />
        <Songs pr={pr} />
      </div>
    </div>
  )
}

/* ───────────── instrument registry (add new instruments here) ───────────── */
const PANELS = { guitar: GuitarPanel }

function ComingNext({ focusId }) {
  const { s, patch } = useApp()
  const votes = s.practice.votes || {}
  const vote = (id) => { patch((st) => ({ practice: { ...st.practice, votes: { ...st.practice.votes, [id]: !st.practice.votes?.[id] } } })); track('music_interest_' + id) }
  const upcoming = instruments.filter((i) => !i.ready)
  return (
    <div style={{ border: '2px dashed rgba(37,99,235,0.35)', background: 'rgba(37,99,235,0.04)', borderRadius: 22, padding: 'clamp(18px,2.4vw,26px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: '#fff', background: C.blue, borderRadius: 999, padding: '4px 10px' }}>Coming next</span>
        <div style={{ fontWeight: 800, fontSize: 16 }}>More instruments are on the way</div>
      </div>
      <p style={{ color: C.sub, fontSize: 13.5, lineHeight: 1.6, margin: '0 0 14px', maxWidth: 640 }}>
        Each instrument gets its own practice plan, tools and library, plugged into the same streaks and Life Recap. Tell me which one you want first.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
        {upcoming.map((i) => (
          <div key={i.id} style={{ background: '#fff', border: '1px solid ' + (focusId === i.id ? 'rgba(37,99,235,0.5)' : 'rgba(0,0,0,0.08)'), borderRadius: 16, padding: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{i.icon} {i.name}</div>
            <div style={{ fontSize: 12.5, color: C.sub, margin: '6px 0 12px', lineHeight: 1.5 }}>{i.blurb}</div>
            <button onClick={() => vote(i.id)} aria-pressed={!!votes[i.id]} style={pill(!!votes[i.id])}>{votes[i.id] ? '✓ Requested' : '🔔 I want this'}</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Music() {
  const [tab, setTab] = useState('guitar')
  const Panel = PANELS[tab]
  const sel = useMemo(() => instruments.find((i) => i.id === tab), [tab])
  return (
    <div style={{ animation: 'rise 0.25s ease-out' }}>
      <h1 style={{ fontWeight: 800, fontSize: 'clamp(24px,3.4vw,32px)', letterSpacing: -1, margin: '0 0 6px' }}>Music</h1>
      <p style={{ color: C.sub, fontSize: 14, margin: '0 0 18px' }}>Small daily practice beats rare long sessions. Plan it, play it, keep the streak.</p>

      <div role="tablist" aria-label="Instrument" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {instruments.map((i) => (
          <button key={i.id} role="tab" aria-selected={tab === i.id} onClick={() => setTab(i.id)} style={{ ...pill(tab === i.id), padding: '10px 16px', opacity: i.ready ? 1 : 0.85 }}>
            {i.icon} {i.name}{!i.ready && <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 800, letterSpacing: 0.6, color: C.blue, background: 'rgba(37,99,235,0.1)', borderRadius: 999, padding: '2px 7px' }}>SOON</span>}
          </button>
        ))}
      </div>

      {Panel ? <Panel /> : (
        <div style={{ ...card, borderRadius: 22, padding: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>{sel.icon}</div>
          <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>{sel.name} is coming soon</div>
          <div style={{ color: C.sub, fontSize: 14 }}>{sel.blurb}</div>
        </div>
      )}

      <div style={{ marginTop: 22 }}><ComingNext focusId={Panel ? '' : tab} /></div>
    </div>
  )
}
