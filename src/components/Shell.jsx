import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useApp, useMobile } from '../store.jsx'
import { C, grad, gradSoft, auroraBg } from '../theme.js'
import Fab from './Fab.jsx'
import { IS_DEMO, resetDemo } from '../config.js'
import QuickAdd, { QuickBar } from './QuickAdd.jsx'

const navDefs = [
  { id: 'today', label: 'Today', icon: '☀️' },
  { id: 'goals', label: 'Goals', icon: '🎯' },
  { id: 'calendar', label: 'Calendar', icon: '🗓' },
  { id: 'people', label: 'People', icon: '🌱' },
  { id: 'habits', label: 'Habits', icon: '✅' },
  { id: 'finance', label: 'Finance', icon: '₹' },
  { id: 'gym', label: 'Gym & Health', icon: '🏋️' },
  { id: 'music', label: 'Music', icon: '🎸' },
  { divider: true },
  { id: 'insights', label: 'Insights', icon: '🧠' },
  { id: 'review', label: 'Weekly Review', icon: '🏁' },
  { id: 'recap', label: 'Life Recap', icon: '🎞' },
  { id: 'journal', label: 'Journal', icon: '📓' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
  ...(IS_DEMO ? [{ id: 'about', label: 'About this project', icon: '💡' }] : []),
]

const bnDefs = [
  { id: 'today', label: 'Today', icon: '☀️' },
  { id: 'calendar', label: 'Cal', icon: '🗓' },
  { id: 'habits', label: 'Habits', icon: '✅' },
  { id: 'finance', label: '₹', icon: '💸' },
  { id: 'gym', label: 'Gym', icon: '🏋️' },
]

const moreDefs = [
  { id: 'goals', label: 'Goals', icon: '🎯' },
  { id: 'people', label: 'People', icon: '🌱' },
  { id: 'music', label: 'Music', icon: '🎸' },
  { id: 'insights', label: 'Insights', icon: '🧠' },
  { id: 'review', label: 'Weekly Review', icon: '🏁' },
  { id: 'recap', label: 'Life Recap', icon: '🎞' },
  { id: 'journal', label: 'Journal', icon: '📓' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
  ...(IS_DEMO ? [{ id: 'about', label: 'About', icon: '💡' }] : []),
]

function Logo() {
  return (
    <div style={{ fontWeight: 800, fontSize: 17, padding: '2px 12px 18px', letterSpacing: -0.4 }}>
      effici<span style={{ background: grad, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>a</span>nce
    </div>
  )
}

function DemoBanner({ onAbout }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', background: 'rgba(var(--a1-rgb),0.08)', border: '1px solid rgba(var(--a1-rgb),0.22)', borderRadius: 14, padding: '9px 14px', marginBottom: 18, fontSize: 12.5, color: C.sub, fontWeight: 600 }}>
      <span>🧪 <b style={{ color: C.text }}>Interactive demo</b> · fictional sample data, saved only in your browser</span>
      <span style={{ display: 'flex', gap: 16 }}>
        <button onClick={resetDemo} style={{ background: 'transparent', border: 'none', color: C.sub, fontWeight: 700, fontSize: 12.5, padding: 0 }}>Reset demo</button>
        <button onClick={onAbout} style={{ background: 'transparent', border: 'none', color: C.blue, fontWeight: 800, fontSize: 12.5, padding: 0 }}>What is this project? →</button>
      </span>
    </div>
  )
}

export default function Shell() {
  const { s } = useApp()
  const mobile = useMobile()
  const nav = useNavigate()
  const { pathname } = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)

  const page = pathname.replace(/^\//, '') || 'today'
  const P = (id) => page === id
  const go = (id) => { setMoreOpen(false); nav('/' + id); window.scrollTo(0, 0) }
  const userName = (s.name || '').trim() || (IS_DEMO ? 'Alex' : 'there')

  return (
    <div style={auroraBg}>
      <div className="orbs" aria-hidden="true"><i /><i /></div>
      <a href="#main" style={{ position: 'absolute', left: -9999, top: 8, zIndex: 100, background: '#fff', padding: '8px 12px', borderRadius: 8 }} onFocus={(e) => { e.currentTarget.style.left = '8px' }} onBlur={(e) => { e.currentTarget.style.left = '-9999px' }}>Skip to content</a>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', minHeight: '100vh' }}>
        {!mobile && (
          <div style={{ width: 224, flex: 'none', padding: '18px 0 18px 18px', position: 'sticky', top: 0, height: '100vh' }}>
            <div className="glass-panel" style={{
              background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.085)', borderTopColor: 'rgba(0,0,0,0.05)',
              borderRadius: 22, boxShadow: '0 1px 2px rgba(16,24,40,0.05),0 10px 30px rgba(16,24,40,0.08)',
              height: '100%', display: 'flex', flexDirection: 'column', padding: '20px 12px',
            }}>
              <Logo />
              <div style={{ padding: '0 0 12px' }}><QuickBar compact /></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto', overflowX: 'hidden', minWidth: 0, flex: 1 }}>
                {navDefs.map((d, i) => d.divider ? (
                  <div key={i} style={{ height: 1, background: 'rgba(0,0,0,0.07)', margin: '10px 8px' }} />
                ) : (
                  <button key={d.id} onClick={() => go(d.id)} className={P(d.id) ? '' : 'nav-btn'} style={{
                    display: 'flex', alignItems: 'center', gap: 11,
                    background: P(d.id) ? gradSoft : 'transparent',
                    border: 'none', borderRadius: 12, padding: '10px 12px',
                    color: P(d.id) ? C.text : C.sub, fontSize: 13.5, fontWeight: 700, textAlign: 'left',
                  }}>
                    <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{d.icon}</span>{d.label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 10px 4px', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#fff' }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
                  <div style={{ color: C.muted, fontSize: 11 }}>Life OS · v1</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <main id="main" style={{ flex: 1, minWidth: 0, maxWidth: 1280, margin: '0 auto', padding: 'clamp(16px,3vw,32px) clamp(16px,3vw,36px) 120px' }}>
          {IS_DEMO && <DemoBanner onAbout={() => go('about')} />}
          <div className="stagger-page" key={pathname}><Outlet /></div>
        </main>
      </div>

      {mobile && (
        <>
          <div className="glass-panel" style={{
            position: 'fixed', bottom: 'calc(14px + env(safe-area-inset-bottom))', left: 14, right: 14, zIndex: 40,
            background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 20,
            boxShadow: '0 6px 28px rgba(16,24,40,0.16)', display: 'flex', justifyContent: 'space-around', padding: '8px 6px',
          }}>
            {bnDefs.map((d) => (
              <button key={d.id} onClick={() => go(d.id)} style={{
                background: P(d.id) ? 'linear-gradient(135deg,rgba(var(--a1-rgb),0.35),rgba(var(--a2-rgb),0.35))' : 'transparent',
                border: 'none', borderRadius: 12, padding: '8px 10px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 3, color: P(d.id) ? C.text : C.sub, fontSize: 10, fontWeight: 700, minWidth: 48,
              }}>
                <span style={{ fontSize: 17 }}>{d.icon}</span>{d.label}
              </button>
            ))}
            <button onClick={() => setMoreOpen(!moreOpen)} style={{
              background: 'transparent', border: 'none', borderRadius: 12, padding: '8px 10px', display: 'flex',
              flexDirection: 'column', alignItems: 'center', gap: 3, color: C.sub, fontSize: 10, fontWeight: 700, minWidth: 48,
            }}>
              <span style={{ fontSize: 17 }}>⋯</span>More
            </button>
          </div>
          {moreOpen && (
            <>
              <div onClick={() => setMoreOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 39, background: 'rgba(17,24,39,0.32)', backdropFilter: 'blur(4px)' }} />
              <div style={{
                position: 'fixed', bottom: 'calc(86px + env(safe-area-inset-bottom))', left: 14, right: 14, zIndex: 41, background: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.09)', borderRadius: 20, padding: 12,
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, animation: 'rise 0.2s ease-out',
              }}>
                {moreDefs.map((d) => (
                  <button key={d.id} onClick={() => go(d.id)} style={{
                    background: 'rgba(0,0,0,0.045)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 14,
                    padding: 14, color: C.text, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ fontSize: 16 }}>{d.icon}</span>{d.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <QuickAdd />
      <Fab mobile={mobile} />
    </div>
  )
}
