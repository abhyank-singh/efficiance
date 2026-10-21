import { useNavigate } from 'react-router-dom'
import { C, grad, card, label } from '../theme.js'
import { monthDay } from '../data/dates.js'

const wins = [
  { t: 'Held a 12-day meditation streak', i: '🧘' },
  { t: 'PB: Bench Press 70kg × 5', i: '🏋️' },
  { t: 'Finished Part II of Deep Work', i: '📚' },
  { t: 'Stayed under budget in 4 of 6 categories', i: '₹' },
]

const reviewStats = [
  { label: 'Habit consistency', val: '84%', dash: '32' },
  { label: 'Sleep average', val: '6.9h', dash: '62' },
  { label: 'Budget used', val: '53%', dash: '95' },
  { label: 'People connected', val: '5', dash: '70' },
  { label: 'Learning hours', val: '4.5h', dash: '50' },
]

export default function Review() {
  const nav = useNavigate()

  return (
    <div style={{ animation: 'rise 0.25s ease-out', maxWidth: 860, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={label}>Weekly Life Sprint Review</div>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(24px,3.4vw,32px)', letterSpacing: -1, margin: '10px 0 4px' }}>Week of {monthDay(-10)} – {monthDay(-4)}</h1>
        <div style={{ color: C.sub, fontSize: 13.5 }}>Auto-generated every Sunday · screenshot-worthy on purpose</div>
      </div>

      <div style={{ ...card, borderRadius: 26, padding: 'clamp(24px,4vw,36px)' }}>
        <div style={{ ...label, color: C.sub, marginBottom: 14 }}>🏆 Wins of the week</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 10, marginBottom: 28 }}>
          {wins.map((w) => (
            <div key={w.t} style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(16,185,129,0.1))', border: '1px solid rgba(34,211,174,0.25)', borderRadius: 14, padding: '13px 15px' }}>
              <span style={{ fontSize: 18 }}>{w.i}</span>
              <span style={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.35 }}>{w.t}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', gap: 10, flexWrap: 'wrap', padding: '20px 0', borderTop: '1px solid rgba(0,0,0,0.07)', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          {reviewStats.map((st) => (
            <div key={st.label} style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 76, height: 76, margin: '0 auto' }}>
                <svg width="76" height="76" viewBox="0 0 76 76">
                  <circle cx="38" cy="38" r="32" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="7" />
                  <circle cx="38" cy="38" r="32" fill="none" stroke="url(#eg)" strokeWidth="7" strokeLinecap="round" strokeDasharray="201" strokeDashoffset={st.dash} transform="rotate(-90 38 38)" style={{ animation: 'ringin 0.8s ease-out' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, fontFeatureSettings: "'tnum'" }}>{st.val}</div>
              </div>
              <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, marginTop: 8, maxWidth: 90 }}>{st.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, background: 'rgba(0,0,0,0.035)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 18, padding: 20 }}>
          <div style={{ ...label, marginBottom: 8 }}>🧭 Focus suggestion for next week</div>
          <div style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.5 }}>
            Move your two evening workouts to 7 AM — your completion rate doubles before 8 AM, and it frees Tuesday evening for your most consistent learning block.
          </div>
        </div>

        <button onClick={() => nav('/calendar')} className="lift" style={{ marginTop: 22, width: '100%', background: grad, border: 'none', color: '#fff', padding: 15, borderRadius: 15, fontWeight: 800, fontSize: 15 }}>
          Plan next week → pre-fill calendar blocks
        </button>
      </div>
    </div>
  )
}
