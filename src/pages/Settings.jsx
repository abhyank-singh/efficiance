import { useApp } from '../store.jsx'
import { C, gradTab, label } from '../theme.js'
import { focusAreas } from '../data/seed.js'
import { IS_DEMO, resetDemo } from '../config.js'
import { InstallCard } from '../components/Install.jsx'

const comingSoon = [{ name: 'UPI notification auto-capture' }, { name: 'RBI Account Aggregator connect' }]

export default function Settings() {
  const { s, patch } = useApp()

  const toggleIntegration = (k) =>
    patch((st) => ({ integrations: { ...st.integrations, [k]: !st.integrations[k] } }))

  const toggleFocus = (name) =>
    patch((st) => ({ focus: st.focus.includes(name) ? st.focus.filter((x) => x !== name) : st.focus.concat(name) }))

  const exportData = () => {
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'efficiance-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const smallCard = { background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 18, padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }

  return (
    <div style={{ animation: 'rise 0.25s ease-out', maxWidth: 860, margin: '0 auto' }}>
      <h1 style={{ fontWeight: 800, fontSize: 'clamp(24px,3.4vw,32px)', letterSpacing: -1, margin: '0 0 22px' }}>Settings & Integrations</h1>

      <InstallCard />

      <div style={{ ...label, color: C.sub, marginBottom: 12 }}>Integrations</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12, marginBottom: 14 }}>
        {Object.keys(s.integrations).map((k) => {
          const on = s.integrations[k]
          return (
            <div key={k} style={smallCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: on ? C.greenDeep : 'rgba(148,163,184,0.4)', flex: 'none' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{k}</div>
                  <div style={{ color: C.muted, fontSize: 11.5, fontWeight: 600 }}>{on ? 'Connected · demo mode' : 'Connect'}</div>
                </div>
              </div>
              <button onClick={() => toggleIntegration(k)} className="text-hover-dark bd-hover" style={{ background: 'rgba(0,0,0,0.045)', border: '1px solid rgba(0,0,0,0.09)', color: C.sub, padding: '7px 13px', borderRadius: 10, fontWeight: 700, fontSize: 12, flex: 'none' }}>
                {on ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 30 }}>
        {comingSoon.map((c) => (
          <div key={c.name} style={{ background: 'rgba(0,0,0,0.024)', border: '1.5px dashed rgba(0,0,0,0.1)', borderRadius: 14, padding: '12px 18px', color: C.muted, fontSize: 12.5, fontWeight: 700 }}>
            {c.name} · Coming soon
          </div>
        ))}
      </div>

      <div style={{ ...label, color: C.sub, marginBottom: 12 }}>Focus areas · reconfigures your dashboard</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 30 }}>
        {focusAreas.map((f) => {
          const sel = s.focus.includes(f.name)
          return (
            <button key={f.name} onClick={() => toggleFocus(f.name)} className="lift" style={{
              background: sel ? gradTab : 'rgba(0,0,0,0.04)',
              border: '1px solid ' + (sel ? 'rgba(var(--a1-rgb),0.6)' : 'rgba(0,0,0,0.09)'),
              color: C.text, padding: '11px 17px', borderRadius: 999, fontSize: 13.5, fontWeight: 700,
            }}>
              {f.icon} {f.name}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12 }}>
        <div style={smallCard}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>Theme</div>
            <div style={{ color: C.muted, fontSize: 11.5, fontWeight: 600 }}>Light · evening mode on Today</div>
          </div>
          <span style={{ fontSize: 17 }}>🌙</span>
        </div>
        <div style={smallCard}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>Notifications</div>
            <div style={{ color: C.muted, fontSize: 11.5, fontWeight: 600 }}>Briefing 7:30 AM · Day Close 9 PM</div>
          </div>
          <span style={{ fontSize: 17 }}>🔔</span>
        </div>
        <button onClick={exportData} className="bd-hover" style={{ ...smallCard, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>Export my data</div>
            <div style={{ color: C.muted, fontSize: 11.5, fontWeight: 600 }}>JSON · everything, always yours</div>
          </div>
          <span style={{ fontSize: 17 }}>⬇</span>
        </button>
        {IS_DEMO && (
          <button onClick={resetDemo} className="bd-hover" style={{ ...smallCard, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>Reset demo data</div>
              <div style={{ color: C.muted, fontSize: 11.5, fontWeight: 600 }}>Back to the original sample week</div>
            </div>
            <span style={{ fontSize: 17 }}>↺</span>
          </button>
        )}
      </div>
    </div>
  )
}
