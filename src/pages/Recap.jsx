import { useMemo, useState } from 'react'
import { useApp, fmtINR } from '../store.jsx'
import { C, grad, card, label } from '../theme.js'
import { buildHistory, summarize, level } from '../data/history.js'
import { DEFAULT_NAME } from '../config.js'
import { track } from '../track.js'

const LEVELS = ['rgba(0,0,0,0.07)', '#BFE3D5', '#7CCFB0', '#34B98D', '#0B7F5C']

function Spark({ values, color = '#2563EB', fmt }) {
  const w = 220, h = 54, pad = 4
  const min = Math.min(...values), max = Math.max(...values)
  const pts = values.map((v, i) => [pad + (i / (values.length - 1)) * (w - pad * 2), h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2)])
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')
  const last = pts[pts.length - 1]
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`Trend, latest ${fmt(values[values.length - 1])}`} style={{ display: 'block' }}>
      <path d={d + ` L${w - pad} ${h} L${pad} ${h} Z`} fill={color} opacity="0.09" />
      <path d={d} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3.8" fill={color} />
    </svg>
  )
}

const delta = (a, b, goodUp = true) => {
  if (!b) return null
  const pct = Math.round(((a - b) / b) * 100)
  if (Math.abs(pct) < 1) return { t: '→ flat', good: true }
  return { t: (pct > 0 ? '↑ ' : '↓ ') + Math.abs(pct) + '%', good: goodUp ? pct > 0 : pct < 0 }
}

function Tile({ icon, big, small }) {
  return (
    <div className="card-hover" style={{ ...card, borderRadius: 18, padding: '16px 18px' }}>
      <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: 24, letterSpacing: -0.5, fontFeatureSettings: "'tnum'" }}>{big}</div>
      <div style={{ fontSize: 12, color: C.sub, fontWeight: 600, marginTop: 2 }}>{small}</div>
    </div>
  )
}

function ShareCard({ name, sum, days }) {
  // Pure SVG so it can be rasterised to a PNG in the browser without any library.
  const first = (days[0].date.getDay() + 6) % 7
  const cols = Math.ceil((days.length + first) / 7)
  const x0 = 70, y0 = 318, gapX = 8, gapY = 6, cw = (1060 - gapX * (cols - 1)) / cols, ch = 34
  return (
    <svg id="recap-card" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="100%" role="img" aria-label="Shareable recap card" style={{ display: 'block', borderRadius: 22, boxShadow: '0 14px 40px rgba(16,24,40,0.16)' }}>
      <defs>
        <linearGradient id="rc-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2563EB" /><stop offset="1" stopColor="#12B981" /></linearGradient>
        <linearGradient id="rc-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#EEF3FF" /><stop offset="1" stopColor="#E3F6EE" /></linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#rc-bg)" />
      <text x="70" y="86" fontFamily="system-ui,Helvetica,Arial,sans-serif" fontSize="34" fontWeight="800" fill="#16181D">effici<tspan fill="#0B7F5C">a</tspan>nce</text>
      <text x="70" y="160" fontFamily="system-ui,Helvetica,Arial,sans-serif" fontSize="52" fontWeight="800" fill="#16181D">{name}’s last 12 weeks</text>
      <text x="70" y="206" fontFamily="system-ui,Helvetica,Arial,sans-serif" fontSize="24" fill="#5B6472">Tracked like my biggest project.</text>
      {[['Habit consistency', sum.consistency + '%'], ['Best streak', sum.bestStreak + ' days'], ['Workouts', String(sum.workouts)], ['Guitar practice', Math.round(sum.practice / 60) + ' h']].map(([k, v], i) => (
        <g key={k} transform={`translate(${70 + i * 270},250)`}>
          <text fontFamily="system-ui,Helvetica,Arial,sans-serif" fontSize="44" fontWeight="800" fill="url(#rc-g)">{v}</text>
          <text y="30" fontFamily="system-ui,Helvetica,Arial,sans-serif" fontSize="19" fill="#5B6472">{k}</text>
        </g>
      ))}
      {days.map((d, i) => {
        const idx = i + first
        return <rect key={i} x={x0 + Math.floor(idx / 7) * (cw + gapX)} y={y0 + (idx % 7) * (ch + gapY)} width={cw} height={ch} rx="6" fill={LEVELS[level(d)]} />
      })}
      <text x="70" y="618" fontFamily="system-ui,Helvetica,Arial,sans-serif" fontSize="18" fill="#5B6472">Each square is a day · darker = more done</text>
    </svg>
  )
}

export default function Recap() {
  const { s } = useApp()
  const [range, setRange] = useState(12)
  const name = s.name && s.name !== DEFAULT_NAME ? s.name : DEFAULT_NAME === 'there' ? 'My' : DEFAULT_NAME
  const all = useMemo(() => buildHistory(s), [s.habitState, s.txToday, s.sleepToday, s.practice, s.workouts, s.mood])
  const days = range === 12 ? all : all.slice(-28)
  const sum = useMemo(() => summarize(days), [days])
  const allSum = useMemo(() => summarize(all), [all])
  const w = sum.weeks
  const [msg, setMsg] = useState('')

  const first = (days[0].date.getDay() + 6) % 7
  const cells = [...Array(first).fill(null), ...days]
  const quickAdds = (s.activity || []).length

  const text = `${name === 'My' ? 'My' : name + '’s'} ${range === 12 ? '12-week' : '4-week'} Life Recap: ${sum.consistency}% habit consistency, best streak ${sum.bestStreak} days, ${sum.workouts} workouts, ${Math.round(sum.practice / 60)}h of guitar. Tracked with Efficiance.`

  const download = () => {
    const svg = document.getElementById('recap-card')
    const xml = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = 2400; c.height = 1260
      c.getContext('2d').drawImage(img, 0, 0, 2400, 1260)
      c.toBlob((b) => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(b); a.download = 'efficiance-recap.png'; a.click()
        setTimeout(() => URL.revokeObjectURL(a.href), 2000)
      })
    }
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml)
    track('recap_download')
  }
  const share = async () => {
    track('recap_share')
    try {
      if (navigator.share) await navigator.share({ title: 'My Life Recap', text })
      else { await navigator.clipboard.writeText(text); setMsg('Copied!') }
    } catch { /* cancelled */ }
    setTimeout(() => setMsg(''), 2000)
  }

  const pill = (on) => ({ background: on ? 'linear-gradient(135deg,rgba(59,130,246,0.35),rgba(16,185,129,0.35))' : 'rgba(0,0,0,0.045)', border: '1px solid ' + (on ? 'rgba(34,211,174,0.6)' : 'rgba(0,0,0,0.09)'), color: C.text, padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700 })
  const trend = (title, vals, fmt, goodUp, color) => {
    const d = delta(vals[vals.length - 1], vals[vals.length - 2], goodUp)
    return (
      <div style={{ ...card, borderRadius: 20, padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={label}>{title}</div>
          {d && <span style={{ fontSize: 12, fontWeight: 800, color: d.good ? C.greenDeep : C.amber }}>{d.t} vs last week</span>}
        </div>
        <div style={{ fontWeight: 800, fontSize: 24, margin: '8px 0 6px', fontFeatureSettings: "'tnum'" }}>{fmt(vals[vals.length - 1])}</div>
        <Spark values={vals} color={color} fmt={fmt} />
      </div>
    )
  }

  return (
    <div style={{ animation: 'rise 0.25s ease-out', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 'clamp(24px,3.4vw,32px)', letterSpacing: -1, margin: '0 0 6px' }}>Life Recap</h1>
          <p style={{ color: C.sub, fontSize: 14, margin: '0 0 18px', maxWidth: 560 }}>The longer you track, the more this shows. Your history is the reason to keep going. Sample history plus whatever you log today.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }} role="group" aria-label="Range">
          <button style={pill(range === 4)} aria-pressed={range === 4} onClick={() => setRange(4)}>4 weeks</button>
          <button style={pill(range === 12)} aria-pressed={range === 12} onClick={() => setRange(12)}>12 weeks</button>
        </div>
      </div>

      <div style={{ background: grad, borderRadius: 24, padding: 'clamp(20px,3vw,30px)', color: '#fff', marginBottom: 18, boxShadow: '0 14px 40px rgba(16,185,129,0.25)' }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.85 }}>Highlights</div>
        <div style={{ fontWeight: 800, fontSize: 'clamp(20px,2.8vw,28px)', lineHeight: 1.3, margin: '8px 0 0', maxWidth: 760 }}>
          You hit your habits {sum.consistency}% of the time, your best day is {sum.bestDay}, and your longest strong run was {sum.bestStreak} days.
        </div>
        <div style={{ fontSize: 13.5, opacity: 0.92, marginTop: 10 }}>Best week: {range === 12 ? 'week ' + (sum.bestWeek + 1) + ' of 12' : 'week ' + (sum.bestWeek + 1) + ' of 4'}{quickAdds ? ` · ${quickAdds} things logged with Quick Add` : ''}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12, marginBottom: 18 }}>
        <Tile icon="✅" big={sum.consistency + '%'} small="habit consistency" />
        <Tile icon="🔥" big={sum.bestStreak + ' days'} small="longest strong streak" />
        <Tile icon="😴" big={sum.avgSleep.toFixed(1) + 'h'} small="average sleep" />
        <Tile icon="₹" big={fmtINR(sum.perDay)} small="average spend / day" />
        <Tile icon="🏋️" big={String(sum.workouts)} small="workouts" />
        <Tile icon="🎸" big={Math.round(sum.practice / 60) + ' h'} small="guitar practice" />
      </div>

      <div style={{ ...card, borderRadius: 22, padding: 'clamp(18px,2.4vw,26px)', marginBottom: 18 }}>
        <div style={{ ...label, marginBottom: 14 }}>Consistency map · each square is a day</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.ceil(cells.length / 7)}, minmax(0, 1fr))`, gridTemplateRows: 'repeat(7, 28px)', gridAutoFlow: 'column', gap: 5, maxWidth: 760 }} role="img" aria-label="Daily consistency heatmap">
          {cells.map((d, i) => d
            ? <div key={i} title={`${d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${d.habits}/5 habits`} style={{ borderRadius: 6, background: LEVELS[level(d)] }} />
            : <div key={i} />)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 11.5, color: C.sub, fontWeight: 600 }}>
          Less {LEVELS.map((c) => <span key={c} style={{ width: 13, height: 13, borderRadius: 3, background: c }} />)} More
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14, marginBottom: 22 }}>
        {trend('Sleep · weekly avg', w.map((x) => x.sleep), (v) => v.toFixed(1) + 'h', true, '#2563EB')}
        {trend('Spend · weekly', w.map((x) => x.spend), (v) => fmtINR(Math.round(v)), false, '#B45309')}
        {trend('Guitar · weekly min', w.map((x) => x.practice), (v) => Math.round(v) + ' min', true, '#0B7F5C')}
      </div>

      <div style={{ ...label, marginBottom: 12 }}>Share your recap</div>
      <div style={{ maxWidth: 640 }}>
        <ShareCard name={name === 'My' ? 'My' : name} sum={allSum} days={all} />
        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={download} className="lift" style={{ background: grad, border: 'none', color: '#fff', padding: '12px 20px', borderRadius: 14, fontWeight: 800 }}>⬇ Download image</button>
          <button onClick={share} className="lift" style={{ ...pill(false), padding: '12px 18px' }}>Share text</button>
          {msg && <span style={{ fontSize: 13, color: C.greenDeep, fontWeight: 700 }}>{msg}</span>}
        </div>
      </div>
    </div>
  )
}
