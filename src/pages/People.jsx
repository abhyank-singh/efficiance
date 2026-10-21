import { useApp } from '../store.jsx'
import { C, card, label } from '../theme.js'
import { people, occasions } from '../data/seed.js'
import { getDueList } from '../data/derived.js'

// Warmth model: contact recency drives avatar glow — recent = green glow,
// fading = blue, neglected = grey. No red badges, no guilt.

export default function People() {
  const { s, patch } = useApp()
  const dueList = getDueList(s.peopleLogged)

  const logContact = (id, how) =>
    patch((st) => ({ peopleLogged: { ...st.peopleLogged, [id]: how } }))

  const celebrate = (id) =>
    patch((st) => ({ celebrated: { ...st.celebrated, [id]: true } }))

  return (
    <div style={{ animation: 'rise 0.25s ease-out' }}>
      <h1 style={{ fontWeight: 800, fontSize: 'clamp(24px,3.4vw,32px)', letterSpacing: -1, margin: '0 0 6px' }}>People</h1>
      <p style={{ color: C.sub, fontSize: 14, margin: '0 0 22px' }}>Warmth fades gently with time — no guilt, just gardening. 🌱</p>

      <div style={{ ...card, boxShadow: 'none', borderRadius: 18, padding: '16px 20px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <span style={label}>Due for a check-in</span>
        {dueList.map((p) => (
          <span key={p.name} style={{ background: 'rgba(59,130,246,0.14)', border: '1px solid rgba(59,130,246,0.35)', borderRadius: 999, padding: '6px 14px', fontSize: 12.5, fontWeight: 700 }}>
            {p.name}
          </span>
        ))}
        {dueList.length === 0 && <span style={{ color: C.greenDeep, fontSize: 12.5, fontWeight: 700 }}>All caught up 🌿</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        {people.map((circle) => (
          <div key={circle.g}>
            <div style={{ ...label, color: C.sub, marginBottom: 12 }}>{circle.g}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 14 }}>
              {circle.list.map((p) => {
                const logged = s.peopleLogged[p.id]
                const d = logged ? 0 : p.d
                const glow = d <= 3
                  ? '0 0 0 3px rgba(16,185,129,0.4),0 0 26px rgba(16,185,129,0.45)'
                  : d <= 12
                    ? '0 0 0 3px rgba(59,130,246,0.25),0 0 18px rgba(59,130,246,0.25)'
                    : '0 0 0 3px rgba(148,163,184,0.12)'
                const avBg = d <= 3
                  ? 'linear-gradient(135deg,#2563EB,#12B981)'
                  : d <= 12
                    ? 'linear-gradient(135deg,rgba(59,130,246,0.7),rgba(16,185,129,0.4))'
                    : 'rgba(148,163,184,0.25)'
                return (
                  <div key={p.id} className="card-hover" style={{ ...card, borderRadius: 20, padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: avBg, boxShadow: glow, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flex: 'none', transition: 'box-shadow 0.4s ease', color: d <= 12 ? '#fff' : C.text }}>
                        {p.n.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14.5 }}>{p.n}</div>
                        <div style={{ color: C.muted, fontSize: 11.5, fontWeight: 600 }}>{p.cad} cadence</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12.5, color: logged ? C.greenDeep : C.sub, fontWeight: 600, marginBottom: 12 }}>
                      {logged ? 'Connected just now ✓' : `Last connected ${p.d}d ago`}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[['📞', 'Called'], ['🤝', 'Met'], ['💬', 'Texted']].map(([icon, how]) => (
                        <button key={how} onClick={() => logContact(p.id, how)} className="bd-hover-teal" style={{ flex: 1, background: 'rgba(0,0,0,0.045)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: '8px 4px', color: C.text, fontSize: 11.5, fontWeight: 700 }}>
                          {icon} {how}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <div style={{ ...label, color: C.sub }}>Occasions</div>
          <button className="text-hover-dark" style={{ background: 'rgba(0,0,0,0.045)', border: '1px solid rgba(0,0,0,0.09)', color: C.sub, padding: '8px 14px', borderRadius: 10, fontWeight: 700, fontSize: 12 }}>
            Import from Google Contacts · demo
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 14 }}>
          {occasions.map((o) => (
            <div key={o.id} style={{ ...card, boxShadow: 'none', borderRadius: 20, padding: 18, position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>{o.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{o.name}</div>
                  <div style={{ color: C.sub, fontSize: 12, fontWeight: 600 }}>{o.date} · <span style={{ color: C.greenDeep }}>{o.inDays}</span></div>
                </div>
              </div>
              {o.gift && (
                <div style={{ marginTop: 12, background: 'rgba(0,0,0,0.035)', border: '1px dashed rgba(0,0,0,0.09)', borderRadius: 12, padding: '10px 12px', fontSize: 12.5, color: C.sub }}>
                  🎁 {o.gift}
                </div>
              )}
              {s.celebrated[o.id] ? (
                <div style={{ marginTop: 12, color: C.greenDeep, fontWeight: 800, fontSize: 13 }}>Celebrated 🎉</div>
              ) : (
                <button onClick={() => celebrate(o.id)} className="lift" style={{ marginTop: 12, background: 'linear-gradient(135deg,rgba(59,130,246,0.3),rgba(16,185,129,0.3))', border: '1px solid rgba(34,211,174,0.4)', color: C.text, padding: '8px 16px', borderRadius: 999, fontWeight: 800, fontSize: 12.5 }}>
                  Celebrated 🎉
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
