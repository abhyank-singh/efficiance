import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store.jsx'
import { C, grad, label } from '../theme.js'
import { payees } from '../data/seed.js'

// Global quick-actions FAB + "Log a spend" modal (amount → payee → auto category → done).

export default function Fab({ mobile }) {
  const { s, patch } = useApp()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const qaOpen = s.qaOpen
  const setQaOpen = (v) => patch({ qaOpen: v })
  const [amt, setAmt] = useState('')
  const [payeeIdx, setPayeeIdx] = useState(-1)

  const picked = payeeIdx >= 0 ? payees[payeeIdx] : null

  const items = [
    { icon: '₹', label: 'Log expense', go: () => { setOpen(false); setQaOpen(true) } },
    { icon: '✅', label: 'Check a habit', go: () => { setOpen(false); nav('/habits') } },
    { icon: '🏋️', label: 'Log a set', go: () => { setOpen(false); patch({ workoutOn: true }); nav('/gym') } },
    { icon: '🌱', label: 'Log a connection', go: () => { setOpen(false); nav('/people') } },
    { icon: '📓', label: 'Journal line', go: () => { setOpen(false); patch({ evening: true }); nav('/today') } },
  ]

  const addTx = () => {
    if (!amt || !picked) return
    patch((s) => ({ txToday: s.txToday.concat([{ p: picked.name, i: picked.icon, c: picked.cat, a: parseInt(amt, 10) }]) }))
    setQaOpen(false)
    setAmt('')
    setPayeeIdx(-1)
    nav('/finance')
  }

  return (
    <>
      <button aria-label="Quick actions" aria-expanded={open} onClick={() => setOpen(!open)} className="scale-hover" style={{
        position: 'fixed', bottom: mobile ? 92 : 24, right: 22, zIndex: 45, width: 58, height: 58,
        borderRadius: '50%', background: grad, border: 'none', color: '#fff', fontSize: 26, fontWeight: 400,
        boxShadow: '0 8px 32px rgba(16,185,129,0.45)',
      }}>
        {open ? '✕' : '+'}
      </button>

      {open && (
        <div style={{ position: 'fixed', bottom: mobile ? 160 : 92, right: 22, zIndex: 45, display: 'flex', flexDirection: 'column', gap: 8, animation: 'rise 0.2s ease-out' }}>
          {items.map((f) => (
            <button key={f.label} onClick={f.go} className="bd-hover-teal" style={{
              background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 14, padding: '12px 16px',
              color: C.text, fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 6px 22px rgba(16,24,40,0.14)', textAlign: 'left',
            }}>
              <span>{f.icon}</span>{f.label}
            </button>
          ))}
        </div>
      )}

      {qaOpen && (
        <>
          <div onClick={() => setQaOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(17,24,39,0.34)', backdropFilter: 'blur(6px)' }} />
          <div style={{
            position: 'fixed', zIndex: 51, left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
            width: 'min(440px,92vw)', background: '#FFFFFF', backdropFilter: 'blur(28px) saturate(140%)',
            border: '1px solid rgba(0,0,0,0.09)', borderTopColor: 'rgba(0,0,0,0.05)', borderRadius: 24,
            boxShadow: '0 24px 60px rgba(16,24,40,0.2)', padding: 26, animation: 'rise 0.2s ease-out',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Log a spend</div>
              <button aria-label="Close" onClick={() => setQaOpen(false)} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: 10, color: C.sub, width: 30, height: 30, fontSize: 14 }}>✕</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.045)', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 14, padding: '4px 16px' }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: C.sub }}>₹</span>
              <input
                value={amt}
                onChange={(e) => setAmt(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0"
                inputMode="numeric"
                autoFocus
                style={{ flex: 1, background: 'none', border: 'none', color: C.text, fontSize: 26, fontWeight: 800, padding: '12px 0', fontFeatureSettings: "'tnum'", minWidth: 0 }}
              />
            </div>
            <div style={{ ...label, margin: '16px 0 8px' }}>Payee</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {payees.map((p, i) => (
                <button key={p.name} onClick={() => setPayeeIdx(i)} style={{
                  background: i === payeeIdx ? 'rgba(59,130,246,0.18)' : 'rgba(0,0,0,0.045)',
                  border: '1px solid ' + (i === payeeIdx ? 'rgba(59,130,246,0.5)' : 'rgba(0,0,0,0.08)'),
                  borderRadius: 999, padding: '8px 14px', color: C.text, fontSize: 13, fontWeight: 700,
                }}>
                  {p.icon} {p.name}
                </button>
              ))}
            </div>
            {picked && (
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, color: C.sub, fontSize: 13 }}>
                Category: <span style={{ background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(59,130,246,0.4)', borderRadius: 999, padding: '5px 12px', color: C.text, fontWeight: 700, fontSize: 12.5 }}>{picked.cat}</span>
                <span style={{ color: C.muted, fontSize: 12 }}>auto-suggested</span>
              </div>
            )}
            <button onClick={addTx} className="lift" style={{ marginTop: 20, width: '100%', background: grad, border: 'none', color: '#fff', padding: 14, borderRadius: 14, fontWeight: 800, fontSize: 15 }}>
              Done ✓
            </button>
          </div>
        </>
      )}
    </>
  )
}
