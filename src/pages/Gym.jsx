import { useEffect, useRef, useState } from 'react'
import { useApp } from '../store.jsx'
import { C, grad, gradTab, card, label } from '../theme.js'
import { library, legDay, sleep } from '../data/seed.js'

const heatCols = ['rgba(0,0,0,0.045)', 'rgba(59,130,246,0.3)', 'rgba(59,130,246,0.55)', 'rgba(16,185,129,0.55)', 'rgba(16,185,129,0.9)']
const gymHeat = Array.from({ length: 28 }, (_, i) => heatCols[(i * 11 + 5 + i * i * 2) % 13 % 5])
const volBars = [42, 48, 45, 55, 52, 61, 58, 66].map((v) => Math.round((v / 66) * 90))
const templates = [
  { name: 'Push / Pull / Legs', desc: '6-day split · your current plan' },
  { name: 'Upper / Lower', desc: '4-day split' },
  { name: 'Full Body', desc: '3-day split' },
]

const sleepMax = 9
const sleepBars = sleep.map((d) => ({
  label: d.label,
  hLabel: d.h.toFixed(1) + 'h',
  barH: Math.round((d.h / sleepMax) * 120),
  col: d.h >= 7.5 ? 'linear-gradient(180deg,#2563EB,#12B981)' : d.h >= 6.5 ? 'rgba(59,130,246,0.55)' : 'rgba(148,163,184,0.4)',
}))
const sleepAvg = sleep.reduce((a, d) => a + d.h, 0) / 7

export default function Gym() {
  const { s, patch } = useApp()
  const [tab, setTab] = useState('train')
  const [wIdx, setWIdx] = useState(0)
  const [kg, setKg] = useState(() => parseInt(legDay[0].target.split('@')[1], 10) || 60)
  const [reps, setReps] = useState(10)
  const [sets, setSets] = useState([])
  const [rest, setRest] = useState(0)
  const restTimer = useRef(null)

  const curEx = legDay[wIdx]
  const pbNow = sets.some((x) => x.pb)

  useEffect(() => () => clearInterval(restTimer.current), [])

  const startRest = () => {
    clearInterval(restTimer.current)
    setRest(90)
    restTimer.current = setInterval(() => {
      setRest((r) => {
        if (r <= 1) { clearInterval(restTimer.current); return 0 }
        return r - 1
      })
    }, 1000)
  }

  const pickExercise = (i) => {
    setWIdx(i)
    setKg(parseInt(legDay[i].target.split('@')[1], 10) || 60)
    setReps(10)
  }

  const logSet = () => {
    setSets(sets.concat([{ ex: curEx.name, kg, reps, pb: kg >= curEx.pb }]))
    startRest()
  }

  const endWorkout = () => {
    patch({ workoutOn: false })
    setSets([])
    setRest(0)
    clearInterval(restTimer.current)
  }

  const stepBtn = { width: 32, height: 32, flex: 'none', borderRadius: 10, background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)', color: C.text, fontSize: 17, fontWeight: 800 }

  return (
    <div style={{ animation: 'rise 0.25s ease-out' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(24px,3.4vw,32px)', letterSpacing: -1, margin: 0 }}>Gym & Health</h1>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: 4, flexWrap: 'wrap' }}>
          {[['train', 'Train'], ['library', 'Library'], ['sleep', 'Sleep'], ['progress', 'Progress']].map(([id, lbl]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              background: tab === id ? gradTab : 'transparent', border: 'none', borderRadius: 9,
              padding: '8px 14px', color: C.text, fontWeight: 700, fontSize: 13,
            }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {tab === 'train' && !s.workoutOn && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
          <div style={{ gridColumn: '1/-1', background: 'linear-gradient(135deg,rgba(59,130,246,0.14),rgba(16,185,129,0.14))', border: '1px solid rgba(34,211,174,0.35)', borderRadius: 22, padding: 26, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ ...label, marginBottom: 8 }}>Up next · fits your 3 PM free block</div>
              <div style={{ fontWeight: 800, fontSize: 24 }}>🦵 Leg Day</div>
              <div style={{ color: C.sub, fontSize: 13.5, marginTop: 5 }}>Squat · Leg Press · Lunges · Leg Curl · Calf Raise</div>
            </div>
            <button onClick={() => patch({ workoutOn: true })} className="lift" style={{ background: grad, border: 'none', color: '#fff', padding: '15px 30px', borderRadius: 15, fontWeight: 800, fontSize: 15, boxShadow: '0 8px 28px rgba(16,185,129,0.35)' }}>
              Start workout →
            </button>
          </div>
          {templates.map((t) => (
            <div key={t.name} className="card-hover" style={{ ...card, boxShadow: 'none', borderRadius: 20, padding: 22 }}>
              <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 5 }}>{t.name}</div>
              <div style={{ color: C.muted, fontSize: 12.5, fontWeight: 600, marginBottom: 14 }}>{t.desc}</div>
              <button style={{ background: 'rgba(0,0,0,0.045)', border: '1px solid rgba(0,0,0,0.09)', color: C.text, padding: '9px 16px', borderRadius: 11, fontWeight: 700, fontSize: 12.5 }}>
                Use template
              </button>
            </div>
          ))}
          <div style={{ background: 'rgba(0,0,0,0.028)', border: '1.5px dashed rgba(0,0,0,0.1)', borderRadius: 20, padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8, color: C.muted, fontWeight: 700, fontSize: 13.5, minHeight: 120, textAlign: 'center' }}>
            ＋ Build custom routine<br /><span style={{ fontWeight: 600, fontSize: 11.5 }}>pick from the exercise library</span>
          </div>
        </div>
      )}

      {tab === 'train' && s.workoutOn && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(360px,1fr))', gap: 16, alignItems: 'start' }}>
          <div style={{ ...card, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ ...label, color: C.greenDeep }}>● Leg Day in progress</div>
              <button onClick={endWorkout} style={{ background: 'rgba(0,0,0,0.045)', border: '1px solid rgba(0,0,0,0.09)', color: C.sub, padding: '7px 13px', borderRadius: 10, fontWeight: 700, fontSize: 12 }}>
                Finish ✓
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {legDay.map((e, i) => (
                <button key={e.name} onClick={() => pickExercise(i)} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: wIdx === i ? 'rgba(59,130,246,0.16)' : 'rgba(0,0,0,0.035)',
                  border: '1px solid ' + (wIdx === i ? 'rgba(59,130,246,0.5)' : 'rgba(0,0,0,0.07)'),
                  borderRadius: 13, padding: '12px 15px', color: C.text, textAlign: 'left', gap: 8,
                }}>
                  <span style={{ fontWeight: 700, fontSize: 13.5 }}>{e.name}</span>
                  <span style={{ color: C.muted, fontSize: 11.5, fontWeight: 700, fontFeatureSettings: "'tnum'", whiteSpace: 'nowrap' }}>{e.target}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ ...card, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{curEx.name}</div>
              <span style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.25),rgba(16,185,129,0.25))', border: '1px solid rgba(34,211,174,0.45)', borderRadius: 999, padding: '5px 12px', fontSize: 11.5, fontWeight: 800, whiteSpace: 'nowrap' }}>
                🏅 PB: {curEx.pb}kg
              </span>
            </div>
            <div style={{ color: C.muted, fontSize: 12.5, fontWeight: 600, marginBottom: 18 }}>Target: {curEx.target}</div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: '1 1 130px', minWidth: 0, background: 'rgba(0,0,0,0.035)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 16, padding: '14px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: 'uppercase', color: C.muted, fontWeight: 700, marginBottom: 8 }}>Weight</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <button onClick={() => setKg(Math.max(0, kg - 2.5))} style={stepBtn}>−</button>
                  <span style={{ fontWeight: 800, fontSize: 21, fontFeatureSettings: "'tnum'", minWidth: 0 }}>{kg}<span style={{ fontSize: 13, color: C.sub }}>kg</span></span>
                  <button onClick={() => setKg(kg + 2.5)} style={stepBtn}>+</button>
                </div>
              </div>
              <div style={{ flex: '1 1 130px', minWidth: 0, background: 'rgba(0,0,0,0.035)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 16, padding: '14px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: 'uppercase', color: C.muted, fontWeight: 700, marginBottom: 8 }}>Reps</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <button onClick={() => setReps(Math.max(1, reps - 1))} style={stepBtn}>−</button>
                  <span style={{ fontWeight: 800, fontSize: 21, fontFeatureSettings: "'tnum'" }}>{reps}</span>
                  <button onClick={() => setReps(reps + 1)} style={stepBtn}>+</button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button onClick={logSet} className="lift" style={{ flex: 1, background: grad, border: 'none', color: '#fff', padding: 13, borderRadius: 13, fontWeight: 800, fontSize: 14.5 }}>
                Log set ✓
              </button>
              {rest > 0 && (
                <span style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 999, padding: '9px 15px', fontSize: 12.5, fontWeight: 800, color: C.amber, fontFeatureSettings: "'tnum'", whiteSpace: 'nowrap' }}>
                  ⏱ Rest {rest}s
                </span>
              )}
            </div>

            {pbNow && (
              <div style={{ marginTop: 14, background: 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(16,185,129,0.2))', border: '1px solid rgba(34,211,174,0.55)', borderRadius: 14, padding: '13px 16px', fontWeight: 800, fontSize: 14, animation: 'glowpulse 2s ease-in-out infinite' }}>
                🎉 New personal best! That's the strongest you've ever been.
              </div>
            )}

            {sets.length > 0 && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 7 }}>
                {sets.map((x, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,0.03)', borderRadius: 11, padding: '9px 13px', fontSize: 12.5 }}>
                    <span style={{ color: C.muted, fontWeight: 800 }}>#{i + 1}</span>
                    <span style={{ flex: 1, fontWeight: 600, color: C.sub }}>{x.ex}</span>
                    <span style={{ fontWeight: 800, fontFeatureSettings: "'tnum'" }}>{x.kg}kg × {x.reps}</span>
                    {x.pb && <span style={{ fontSize: 12 }}>🏅</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          {library.map((part) => (
            <div key={part.part}>
              <div style={{ ...label, color: C.sub, marginBottom: 12 }}>{part.part}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 12 }}>
                {part.list.map((ex) => (
                  <div key={ex.name} className="card-hover" style={{ ...card, boxShadow: 'none', borderRadius: 18, padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{ex.name}</div>
                      <span title="Form video" style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.045)', border: '1px solid rgba(0,0,0,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: C.sub, flex: 'none' }}>▶</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: C.greenDeep, fontFeatureSettings: "'tnum'" }}>{ex.pb}</span>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, background: 'rgba(0,0,0,0.04)', borderRadius: 999, padding: '3px 9px' }}>{ex.tag}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'sleep' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18, alignItems: 'start' }}>
          <div style={{ ...card, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
              <div style={label}>Last 7 nights</div>
              <div style={{ fontSize: 12.5, color: C.sub }}>Avg <b style={{ color: C.text, fontSize: 15, fontFeatureSettings: "'tnum'" }}>{sleepAvg.toFixed(1)}h</b> vs 8h target</div>
            </div>
            <div style={{ position: 'relative', height: 150, display: 'flex', alignItems: 'flex-end', gap: 12, borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 118, borderTop: '1.5px dashed rgba(245,158,11,0.45)' }}>
                <span style={{ position: 'absolute', right: 0, top: -18, fontSize: 10.5, color: C.amber, fontWeight: 700 }}>8h target</span>
              </div>
              {sleepBars.map((d) => (
                <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, justifyContent: 'flex-end', height: '100%' }}>
                  <span style={{ fontSize: 10.5, color: C.sub, fontWeight: 700, fontFeatureSettings: "'tnum'" }}>{d.hLabel}</span>
                  <div style={{ width: '100%', maxWidth: 38, height: d.barH, background: d.col, borderRadius: '8px 8px 3px 3px' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 2 }}>
              {sleepBars.map((d) => (
                <span key={d.label} style={{ flex: 1, textAlign: 'center', fontSize: 10.5, color: C.muted, fontWeight: 700 }}>{d.label}</span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, padding: 20 }}>
              <div style={{ ...label, color: C.amber, marginBottom: 8 }}>Sleep debt</div>
              <div style={{ fontWeight: 800, fontSize: 24, fontFeatureSettings: "'tnum'" }}>
                −{((8 - sleepAvg) * 7).toFixed(1)}h <span style={{ fontSize: 13, color: C.sub, fontWeight: 600 }}>this week</span>
              </div>
              <div style={{ color: C.sub, fontSize: 13, marginTop: 8, lineHeight: 1.55 }}>An earlier night tonight would clear a third of it. Your briefing will remind you gently.</div>
            </div>

            <div style={{ ...card, boxShadow: 'none', borderRadius: 20, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>Wind-down reminder</div>
                <div style={{ color: C.muted, fontSize: 12.5, marginTop: 3 }}>10:30 PM · feeds your Break-habit insight</div>
              </div>
              <button onClick={() => patch({ windDown: !s.windDown })} style={{ width: 46, height: 26, borderRadius: 999, background: s.windDown ? grad : 'rgba(0,0,0,0.08)', border: 'none', position: 'relative', flex: 'none', transition: 'background 0.2s ease' }}>
                <span style={{ position: 'absolute', top: 2, left: s.windDown ? 22 : 2, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left 0.2s ease' }} />
              </button>
            </div>

            <div style={{ ...card, boxShadow: 'none', borderRadius: 20, padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>Sync sleep automatically</div>
              <div style={{ color: C.muted, fontSize: 12.5, marginBottom: 12 }}>Google Fit connected · demo mode</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 999, padding: '6px 13px', fontSize: 12, fontWeight: 700, color: C.greenDeep }}>❤️ Google Fit ✓</span>
                <span style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 999, padding: '6px 13px', fontSize: 12, fontWeight: 700, color: C.sub }}>🍎 Apple Health</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'progress' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, alignItems: 'start' }}>
          <div style={{ ...card, boxShadow: 'none', padding: 22 }}>
            <div style={{ ...label, marginBottom: 16 }}>Weekly volume · tonnes lifted</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
              {volBars.map((h, i) => (
                <div key={i} style={{ flex: 1, height: h, background: 'linear-gradient(180deg,#2563EB,#12B981)', borderRadius: '6px 6px 2px 2px', opacity: 0.85 }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, color: C.muted, fontWeight: 700 }}>
              <span>8 weeks ago</span>
              <span style={{ color: C.greenDeep }}>+57% ↑</span>
            </div>
          </div>

          <div style={{ ...card, boxShadow: 'none', padding: 22 }}>
            <div style={{ ...label, marginBottom: 16 }}>Workout consistency · 28 days</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14,1fr)', gap: 4 }}>
              {gymHeat.map((c, i) => (
                <div key={i} style={{ aspectRatio: 1, borderRadius: 4, background: c }} />
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: C.sub }}>4 sessions/week average · rest days respected 😌</div>
          </div>

          <div style={{ ...card, boxShadow: 'none', padding: 22 }}>
            <div style={{ ...label, marginBottom: 14 }}>Body</div>
            <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 22, fontFeatureSettings: "'tnum'" }}>72.4<span style={{ fontSize: 13, color: C.sub }}>kg</span></div>
                <div style={{ color: C.muted, fontSize: 11.5, fontWeight: 700 }}>WEIGHT · −1.8kg / 8wk</div>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 22, fontFeatureSettings: "'tnum'" }}>17.2<span style={{ fontSize: 13, color: C.sub }}>%</span></div>
                <div style={{ color: C.muted, fontSize: 11.5, fontWeight: 700 }}>BODY FAT · −1.1%</div>
              </div>
            </div>
            <div style={{ marginTop: 16, borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>💧 Water · {s.waterCups} / 8 glasses</span>
                <button onClick={() => patch({ waterCups: Math.min(8, s.waterCups + 1) })} style={{ background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(59,130,246,0.45)', color: C.text, padding: '6px 13px', borderRadius: 999, fontWeight: 800, fontSize: 12 }}>
                  +1 glass
                </button>
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} style={{ flex: 1, height: 26, borderRadius: 7, background: i < s.waterCups ? 'rgba(59,130,246,0.25)' : 'rgba(0,0,0,0.035)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
                    {i < s.waterCups ? '💧' : '·'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
