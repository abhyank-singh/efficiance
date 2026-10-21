import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store.jsx'
import { auroraBg, grad, gradTab, C, card, label } from '../theme.js'
import { focusAreas } from '../data/seed.js'
import { DEFAULT_NAME } from '../config.js'
import { packs } from '../data/packs.js'
import { understand, applyActions, describe } from '../data/actions.js'
import { track } from '../track.js'

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
  const [pack, setPack] = useState(s.starterPack || '')
  const [first, setFirst] = useState('')
  const [firstRes, setFirstRes] = useState(null)
  const [trying, setTrying] = useState(false)

  const preview = name.trim() || DEFAULT_NAME

  const choosePack = (p) => { setPack(p.id); setFocus(p.focus); setFirst(p.tryText); setFirstRes(null) }
  const tryIt = async () => {
    if (!first.trim()) return
    setTrying(true)
    setFirstRes(await understand(first))
    setTrying(false)
  }
  const finish = () => {
    // "First win": apply whatever the user just tried, so Today already reflects it.
    const extra = firstRes?.actions?.length ? applyActions(s, firstRes.actions).patch : {}
    patch({ ...extra, name: preview, focus, connected: { ...connected, google: true }, onboarded: true, starterPack: pack })
    track('onboarding_complete')
    if (firstRes?.actions?.length) track('onboarding_first_win')
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
            <h2 style={{ fontWeight: 700, fontSize: 26, letterSpacing: -0.5, margin: '12px 0 6px' }}>What are you here for?</h2>
            <p style={{ color: C.sub, fontSize: 14, margin: '0 0 16px' }}>Pick a starter pack. It sets your focus areas, and you can fine-tune them below.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginBottom: 22 }}>
              {packs.map((p) => (
                <button key={p.id} onClick={() => choosePack(p)} aria-pressed={pack === p.id} className="lift" style={{
                  textAlign: 'left', borderRadius: 16, padding: '13px 14px', color: C.text,
                  background: pack === p.id ? gradTab : 'rgba(0,0,0,0.04)', border: '1px solid ' + (pack === p.id ? 'rgba(34,211,174,0.6)' : 'rgba(0,0,0,0.09)'),
                }}>
                  <div style={{ fontSize: 20 }}>{p.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 14, marginTop: 4 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{p.desc}</div>
                </button>
              ))}
            </div>
            <div style={{ ...label, marginBottom: 10 }}>Focus areas</div>
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
            <h2 style={{ fontWeight: 700, fontSize: 26, letterSpacing: -0.5, margin: '12px 0 6px' }}>Your first win ✨</h2>
            <p style={{ color: C.sub, fontSize: 14, margin: '0 0 16px' }}>Just type what you did today, the way you’d text a friend. No forms.</p>
            <textarea
              value={first} rows={3} maxLength={500} aria-label="Tell Efficiance what you did today"
              onChange={(e) => { setFirst(e.target.value); setFirstRes(null) }}
              placeholder="e.g. spent 450 on swiggy, slept 6.5 hours, called mom"
              style={{ width: '100%', resize: 'none', background: 'rgba(0,0,0,0.045)', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 14, padding: '14px 16px', color: C.text, fontSize: 15, lineHeight: 1.5 }}
            />
            {!firstRes && (
              <button onClick={tryIt} disabled={!first.trim() || trying} className="lift" style={{ marginTop: 12, background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', color: C.blue, padding: '10px 16px', borderRadius: 12, fontWeight: 800, fontSize: 13.5, opacity: first.trim() ? 1 : 0.5 }}>
                {trying ? 'Reading…' : 'See what I understand →'}
              </button>
            )}
            {firstRes && (
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8, animation: 'rise 0.2s ease-out' }}>
                {firstRes.actions.length ? firstRes.actions.map((a, i) => {
                  const d = describe(a)
                  return <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '10px 12px', fontSize: 13.5, fontWeight: 600 }}><span>{d.icon}</span><span style={{ flex: 1 }}>{d.text}</span><span style={{ color: C.greenDeep, fontWeight: 800 }}>✓</span></div>
                }) : <div style={{ fontSize: 13.5, color: C.sub }}>I couldn’t map that. You can skip, or try “spent 100 on chai”.</div>}
                {firstRes.actions.length > 0 && <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>These will be added when you enter. Your sample calendar loads automatically.</div>}
              </div>
            )}
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
