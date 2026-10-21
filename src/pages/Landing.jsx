import { useNavigate } from 'react-router-dom'
import { auroraBg, grad, C, label } from '../theme.js'
import { ghostApps, featureTiles, worksWith } from '../data/seed.js'
import { shortDay } from '../data/dates.js'
import { PROFILE } from '../config.js'

const gradText = { background: 'linear-gradient(135deg,#2563EB,#0EA478)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }
const gradTextLogo = { background: grad, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }

function Ring({ dash, size = 58 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 76 76">
      <circle cx="38" cy="38" r="32" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="8" />
      <circle cx="38" cy="38" r="32" fill="none" stroke="url(#eg)" strokeWidth="8" strokeLinecap="round" strokeDasharray="201" strokeDashoffset={dash} transform="rotate(-90 38 38)" />
    </svg>
  )
}

export default function Landing() {
  const nav = useNavigate()
  const start = () => nav('/onboarding')

  const cta = (extra) => (
    <button onClick={start} className="lift" style={{
      background: grad, border: 'none', color: '#fff', padding: '16px 34px', borderRadius: 16,
      fontWeight: 800, fontSize: 16, boxShadow: '0 8px 32px rgba(16,185,129,0.35)', ...extra,
    }}>
      Start tracking your life →
    </button>
  )

  return (
    <div style={auroraBg}>
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1180, margin: '0 auto', padding: '28px clamp(20px,4vw,48px) 90px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0 60px' }}>
          <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: -0.5 }}>effici<span style={gradTextLogo}>a</span>nce</div>
          <button onClick={() => nav('/today')} className="bd-hover-dark" style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)', color: C.text, padding: '10px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14 }}>
            Explore the demo
          </button>
        </div>

        <div style={{ textAlign: 'center', maxWidth: 820, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 999, padding: '7px 16px', fontSize: 12.5, color: C.sub, fontWeight: 600, letterSpacing: 0.5 }}>
            ONE INTELLIGENCE LAYER · SEVEN MODULES
          </div>
          <h1 style={{ fontWeight: 800, fontSize: 'clamp(38px,6vw,64px)', lineHeight: 1.08, letterSpacing: -2, margin: '26px 0 20px' }}>
            You have just 1 life.<br />Why not track it like your <span style={gradText}>biggest project?</span>
          </h1>
          <p style={{ color: C.sub, fontSize: 17, lineHeight: 1.65, maxWidth: 620, margin: '0 auto 32px' }}>
            Six apps track fragments of your life. Efficiance connects them — so your calendar knows you're tired, your budget knows your habits, and your one life finally gets managed like your biggest project.
          </p>
          {cta()}
          <div style={{ marginTop: 16 }}>
            <button onClick={() => nav('/about')} style={{ background: 'transparent', border: 'none', color: C.blue, fontWeight: 700, fontSize: 14 }}>How this project works →</button>
          </div>
        </div>

        <div style={{ margin: '70px auto 0', maxWidth: 900, transform: 'perspective(1400px) rotateX(6deg)', transformOrigin: 'top' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.09)', borderTopColor: 'rgba(0,0,0,0.05)', borderRadius: 24, boxShadow: '0 30px 70px rgba(16,24,40,0.14)', padding: 28 }}>
            <div style={{ ...label, marginBottom: 12 }}>Morning Briefing · {shortDay(0)}</div>
            <div style={{ fontSize: 'clamp(16px,2.4vw,21px)', fontWeight: 600, lineHeight: 1.5 }}>
              Good morning, Alex. <span style={{ color: C.blue }}>3 meetings</span> today with a <span style={{ color: C.greenDeep }}>2-hour free block at 3 PM</span> — perfect for Leg Day. Mom's birthday is in 2 days 🎂. You're <span style={{ color: C.amber }}>₹800 over</span> your food budget. You slept 6h 10m.
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 24, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Ring dash={32} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>84%</div>
                  <div style={{ color: C.sub, fontSize: 12 }}>habits this week</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Ring dash={75} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, fontFeatureSettings: "'tnum'" }}>₹14,250</div>
                  <div style={{ color: C.sub, fontSize: 12 }}>of ₹27,000 budget</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.045)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: '10px 14px' }}>
                <span style={{ animation: 'flame 1.6s ease-in-out infinite', display: 'inline-block' }}>🔥</span>
                <span style={{ fontWeight: 800 }}>34-day</span>
                <span style={{ color: C.sub, fontSize: 13 }}>reading streak</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 90 }}>
          <div style={label}>The problem</div>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(24px,3.5vw,34px)', letterSpacing: -1, margin: '14px 0 34px' }}>Your life is scattered across 6 apps</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {ghostApps.map((g) => (
                <div key={g.name} style={{ background: 'rgba(0,0,0,0.028)', border: '1px dashed rgba(0,0,0,0.09)', borderRadius: 14, padding: '12px 16px', color: C.muted, fontSize: 13, fontWeight: 600, opacity: 0.65 }}>
                  {g.icon} {g.name}
                </div>
              ))}
            </div>
            <div style={{ color: C.muted, fontSize: 22, padding: '0 6px' }}>→</div>
            <div style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(59,130,246,0.4)', borderRadius: 18, padding: '18px 26px', fontWeight: 800, fontSize: 17, boxShadow: '0 0 44px rgba(16,185,129,0.25)' }}>
              effici<span style={gradTextLogo}>a</span>nce
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18, marginTop: 90 }}>
          {featureTiles.map((f) => (
            <div key={f.title} className="card-hover" style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.09)', borderTopColor: 'rgba(0,0,0,0.05)', borderRadius: 22, boxShadow: '0 1px 2px rgba(16,24,40,0.05),0 10px 30px rgba(16,24,40,0.08)', padding: 26 }}>
              <div style={{ fontSize: 26, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16.5, marginBottom: 8 }}>{f.title}</div>
              <div style={{ color: C.sub, fontSize: 13.5, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 80 }}>
          <div style={{ ...label, marginBottom: 18 }}>Works with</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {worksWith.map((w) => (
              <div key={w.name} style={{ background: 'rgba(0,0,0,0.038)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: '10px 18px', color: C.sub, fontSize: 13, fontWeight: 600 }}>
                {w.icon} {w.name}
              </div>
            ))}
          </div>
          {cta({ marginTop: 56 })}
        </div>

      </div>
    </div>
  )
}
