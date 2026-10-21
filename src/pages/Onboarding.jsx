import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store.jsx'
import { auroraBg, grad, gradTab, C, card, label } from '../theme.js'
import { focusAreas } from '../data/seed.js'
import { DEFAULT_NAME } from '../config.js'

const gradText = { background: 'linear-gradient(135deg,#2563EB,#0EA478)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }
const calDefs = [
  { k: 'google', name: 'Google Calendar', icon: '🗓' },
  { k: 'outlook', name: 'Outlook', icon: '📧' },
]

export default function Onboarding() {
  const { s, patch } = useApp()
  const nav = useNavigate()
  const [step, setStep] = useState(1)
  const [name, setName] = useState(s.name === DEFAULT_NAME && !s.onboarded ? '' : s.name)
  const [focus, setFocus] = useState(s.focus)
  const [connected, setConnected] = useState(s.connected)

  const preview = name.trim() || DEFAULT_NAME

  const finish = () => {
    patch({ name: preview, focus, connected, onboarded: true })
    nav('/today')
  }
  const next = () => (step === 3 ? finish() : setStep(step + 1))
  const back = () => step > 1 && setStep(step - 1)

  const toggleFocus = (n) =>
    setFocus(focus.includes(n) ? focus.filter((x) => x !== n) : focus.concat(n))

  return (
    <div style={{ ...auroraBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ ...card, borderRadius: 24, padding: 'clamp(26px,4vw,44px)', width: '100%', maxWidth: 560, animation: 'rise 0.3s ease-out', position: 'relative', zIndex: 1 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ width: 26, height: 5, borderRadius: 3, background: i <= step ? grad : 'rgba(0,0,0,0.09)' }} />
            ))}
          </div>
          <button onClick={finish} className="muted-hover" style={{ background: 'none', border: 'none', color: C.muted, fontSize: 13, fontWeight: 600 }}>Skip →</button>
        </div>

        {step === 1 && (
          <>
            <div style={label}>Step 1 of 3</div>
            <h2 style={{ fontWeight: 700, fontSize: 26, letterSpacing: -0.5, margin: '12px 0 22px' }}>What should we call you?</h2>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your first name"
              autoFocus
              style={{ width: '100%', background: 'rgba(0,0,0,0.045)', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 14, padding: '15px 18px', color: C.text, fontSize: 16, fontWeight: 600 }}
            />
            <div style={{ marginTop: 22, background: 'rgba(0,0,0,0.035)', border: '1px dashed rgba(0,0,0,0.09)', borderRadius: 16, padding: 18 }}>
              <div style={{ ...label, marginBottom: 8 }}>Preview</div>
              <div style={{ fontWeight: 600, fontSize: 17 }}>Good morning, <span style={gradText}>{preview}</span> ☀️</div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={label}>Step 2 of 3</div>
            <h2 style={{ fontWeight: 700, fontSize: 26, letterSpacing: -0.5, margin: '12px 0 6px' }}>Pick your focus areas</h2>
            <p style={{ color: C.sub, fontSize: 14, margin: '0 0 22px' }}>Your dashboard configures itself around these. You can change them anytime.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {focusAreas.map((f) => {
                const sel = focus.includes(f.name)
                return (
                  <button key={f.name} onClick={() => toggleFocus(f.name)} style={{
                    background: sel ? gradTab : 'rgba(0,0,0,0.04)',
                    border: '1px solid ' + (sel ? 'rgba(34,211,174,0.6)' : 'rgba(0,0,0,0.09)'),
                    color: C.text, padding: '12px 18px', borderRadius: 999, fontSize: 14, fontWeight: 700, transition: 'all 0.15s ease',
                  }}>
                    {f.icon} {f.name}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={label}>Step 3 of 3</div>
            <h2 style={{ fontWeight: 700, fontSize: 26, letterSpacing: -0.5, margin: '12px 0 6px' }}>Connect your calendar</h2>
            <p style={{ color: C.sub, fontSize: 14, margin: '0 0 22px' }}>Demo mode — a sample week of events populates instantly.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {calDefs.map((c) => {
                const on = connected[c.k]
                return (
                  <button key={c.k} onClick={() => setConnected({ ...connected, [c.k]: true })} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'rgba(0,0,0,0.04)',
                    border: '1px solid ' + (on ? 'rgba(34,211,174,0.55)' : 'rgba(0,0,0,0.09)'),
                    borderRadius: 16, padding: 16,
                  }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{c.icon} {c.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: on ? C.greenDeep : C.blue }}>{on ? 'Synced ✓' : 'Connect'}</span>
                  </button>
                )
              })}
            </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30 }}>
          <button onClick={back} style={{ background: 'none', border: 'none', color: step > 1 ? C.sub : 'transparent', fontWeight: 700, fontSize: 14, padding: '12px 6px', cursor: step > 1 ? 'pointer' : 'default' }}>
            ← Back
          </button>
          <button onClick={next} className="lift" style={{ background: grad, border: 'none', color: '#fff', padding: '13px 28px', borderRadius: 14, fontWeight: 800, fontSize: 15, boxShadow: '0 6px 24px rgba(16,185,129,0.35)' }}>
            {step === 3 ? 'Enter Efficiance →' : 'Continue →'}
          </button>
        </div>

      </div>
    </div>
  )
}
