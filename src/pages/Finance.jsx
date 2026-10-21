import { useState } from 'react'
import { useApp, fmtINR } from '../store.jsx'
import { C, grad, gradTab, card, label, glassPrimary } from '../theme.js'
import { txDays as seedTxDays, budgets as budgetDefs, subs, sips, wishlist } from '../data/seed.js'
import { shortDay } from '../data/dates.js'

const gradText = { background: 'linear-gradient(135deg,var(--a1),var(--ok))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }

const allocSegs = [
  { color: 'var(--a1)', dash: '140.7 201', off: '0' },
  { color: 'var(--ok)', dash: '36.2 201', off: '-140.7' },
  { color: '#F59E0B', dash: '24.1 201', off: '-176.9' },
]
const allocLegend = [
  { name: 'Equity', pct: '70%', color: 'var(--a1)' },
  { name: 'Debt', pct: '18%', color: 'var(--ok)' },
  { name: 'Gold', pct: '12%', color: '#F59E0B' },
]

export default function Finance() {
  const { s, patch } = useApp()
  const [tab, setTab] = useState('spend')
  const [imported, setImported] = useState(false)

  const todaySpent = fmtINR(s.txToday.reduce((a, t) => a + t.a, 0))
  const txDays = [{ label: 'Today · ' + shortDay(0), items: s.txToday.slice().reverse() }, ...seedTxDays].map((d) => ({
    label: d.label,
    total: fmtINR(d.items.reduce((a, t) => a + t.a, 0)),
    items: d.items.map((t) => ({ ...t, amt: fmtINR(t.a) })),
  }))

  const budgets = budgetDefs.map((b) => {
    const pct = Math.round((b.spent / b.cap) * 100)
    const over = pct > 100
    const warn = pct >= 80 && !over
    return {
      ...b, spentFmt: fmtINR(b.spent), capFmt: fmtINR(b.cap),
      pctText: Math.min(pct, 999) + '%', w: Math.min(pct, 100) + '%',
      fill: over ? 'linear-gradient(90deg,#EF4444,#F87171)' : warn ? 'linear-gradient(90deg,#F59E0B,#FBBF24)' : 'linear-gradient(90deg,var(--a1),var(--a2))',
      note: over ? 'Over budget' : warn ? 'Nearing limit' : 'On track',
      noteCol: over ? '#F87171' : warn ? '#F59E0B' : 'var(--ok)',
    }
  })

  return (
    <div style={{ animation: 'rise 0.25s ease-out' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(24px,3.4vw,32px)', letterSpacing: -1, margin: 0 }}>Finance</h1>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: 4 }}>
          {[['spend', 'Spend'], ['budget', 'Budget'], ['invest', 'Invest']].map(([id, lbl]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              background: tab === id ? gradTab : 'transparent', border: 'none', borderRadius: 9,
              padding: '8px 16px', color: C.text, fontWeight: 700, fontSize: 13,
            }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {tab === 'spend' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ ...card, padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={label}>Quick log · UPI-speed</div>
                <span style={{ fontSize: 11, color: C.greenDeep, fontWeight: 700 }}>≤3 taps</span>
              </div>
              <div style={{ color: C.sub, fontSize: 13, marginBottom: 14 }}>
                Today so far: <span style={{ color: C.text, fontWeight: 800, fontFeatureSettings: "'tnum'" }}>{todaySpent}</span>
              </div>
              <button onClick={() => patch({ qaOpen: true })} className="lift" style={{ width: '100%', ...glassPrimary, padding: 13, borderRadius: 14, fontWeight: 800, fontSize: 14.5 }}>
                + Log a spend
              </button>
            </div>

            <div style={{ ...card, boxShadow: 'none', padding: 22 }}>
              <div style={{ ...label, marginBottom: 12 }}>Import</div>
              {!imported ? (
                <button onClick={() => setImported(true)} style={{
                  width: '100%', background: 'rgba(0,0,0,0.04)', border: '1.5px dashed rgba(0,0,0,0.13)',
                  color: C.sub, padding: 18, borderRadius: 14, fontWeight: 700, fontSize: 13,
                }}>
                  ⬆ Upload bank statement CSV / PDF
                </button>
              ) : (
                <div style={{ background: 'rgba(var(--a2-rgb),0.08)', border: '1px solid rgba(var(--a2-rgb),0.35)', borderRadius: 14, padding: 16, animation: 'rise 0.2s ease-out' }}>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: C.greenDeep, marginBottom: 8 }}>statement_jun.csv parsed ✓</div>
                  <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.7 }}>
                    142 transactions found · 131 auto-categorized<br />🍔 Food ₹6,120 · 🛒 Groceries ₹4,890 · 🛺 Transport ₹1,980
                  </div>
                </div>
              )}
              <div style={{ marginTop: 12, fontSize: 11.5, color: C.muted, lineHeight: 1.6 }}>
                Coming soon: UPI notification auto-capture · RBI Account Aggregator
              </div>
            </div>
          </div>

          <div style={{ ...card, padding: 22 }}>
            <div style={{ ...label, marginBottom: 16 }}>Spend feed</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {txDays.map((d) => (
                <div key={d.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 9 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.sub }}>{d.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, fontFeatureSettings: "'tnum'" }}>{d.total}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {d.items.map((t, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'rgba(0,0,0,0.03)', borderRadius: 12, padding: '10px 13px' }}>
                        <span style={{ fontSize: 17 }}>{t.i}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13.5 }}>{t.p}</div>
                          <div style={{ color: C.muted, fontSize: 11, fontWeight: 600 }}>{t.c}</div>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: 14, fontFeatureSettings: "'tnum'" }}>{t.amt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'budget' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18, alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 14 }}>
            {budgets.map((b) => (
              <div key={b.cat} style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.085)', borderTopColor: 'rgba(0,0,0,0.05)', borderRadius: 18, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{b.icon} {b.cat}</span>
                  <span style={{ fontSize: 12.5, color: C.sub }}>
                    <b style={{ color: C.text, fontFeatureSettings: "'tnum'" }}>{b.spentFmt}</b> / {b.capFmt}
                  </span>
                </div>
                <div style={{ height: 9, background: 'rgba(0,0,0,0.05)', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: b.w, background: b.fill, borderRadius: 6, transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11.5 }}>
                  <span style={{ color: b.noteCol, fontWeight: 700 }}>{b.note}</span>
                  <span style={{ color: C.muted, fontWeight: 700, fontFeatureSettings: "'tnum'" }}>{b.pctText}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ ...card, boxShadow: 'none', padding: 22 }}>
            <div style={{ ...label, marginBottom: 14 }}>Subscriptions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {subs.map((sub) => (
                <div key={sub.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.03)', borderRadius: 12, padding: '12px 14px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{sub.name}</div>
                    <div style={{ color: C.muted, fontSize: 11.5, fontWeight: 600 }}>{sub.renews}</div>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 14, fontFeatureSettings: "'tnum'" }}>{sub.amt}/mo</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '11px 13px', fontSize: 12.5, color: C.amber, fontWeight: 600 }}>
              Subscriptions grew ₹450/mo this quarter — review?
            </div>
          </div>
        </div>
      )}

      {tab === 'invest' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ ...label, color: C.sub }}>Active SIPs</div>
            {sips.map((sip) => (
              <div key={sip.fund} className="lift" style={{ ...card, borderRadius: 20, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{sip.fund}</div>
                  <span style={{ fontWeight: 800, fontSize: 16, fontFeatureSettings: "'tnum'", ...gradText, whiteSpace: 'nowrap' }}>{sip.amt}/mo</span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12.5, color: C.sub, flexWrap: 'wrap' }}>
                  <span>Debits {sip.date}</span>
                  <span>Invested: <b style={{ color: C.text, fontFeatureSettings: "'tnum'" }}>{sip.total}</b></span>
                </div>
                {sip.goal && (
                  <div style={{ marginTop: 11, display: 'inline-block', background: 'linear-gradient(135deg,rgba(var(--a1-rgb),0.22),rgba(var(--a2-rgb),0.22))', border: '1px solid rgba(var(--a1-rgb),0.4)', borderRadius: 999, padding: '5px 13px', fontSize: 11.5, fontWeight: 700 }}>
                    🎯 {sip.goal}
                  </div>
                )}
              </div>
            ))}
            <div style={{ ...label, color: C.sub, marginTop: 8 }}>Investment wishlist</div>
            {wishlist.map((w) => (
              <div key={w.fund} style={{ background: 'rgba(0,0,0,0.028)', border: '1.5px dashed rgba(0,0,0,0.1)', borderRadius: 18, padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{w.fund}</div>
                  <div style={{ color: C.muted, fontSize: 12, fontWeight: 600 }}>{w.start}</div>
                </div>
                <span style={{ fontWeight: 800, fontSize: 14, color: C.sub, fontFeatureSettings: "'tnum'" }}>{w.amt}</span>
              </div>
            ))}
          </div>

          <div style={{ ...card, boxShadow: 'none', padding: 24 }}>
            <div style={{ ...label, marginBottom: 18 }}>Allocation</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 130, height: 130 }}>
                <svg width="130" height="130" viewBox="0 0 76 76">
                  <circle cx="38" cy="38" r="32" fill="none" stroke="rgba(0,0,0,0.045)" strokeWidth="9" />
                  {allocSegs.map((seg) => (
                    <circle key={seg.color} cx="38" cy="38" r="32" fill="none" stroke={seg.color} strokeWidth="9" strokeDasharray={seg.dash} strokeDashoffset={seg.off} transform="rotate(-90 38 38)" strokeLinecap="butt" />
                  ))}
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: 17, fontFeatureSettings: "'tnum'" }}>₹2.04L</span>
                  <span style={{ color: C.muted, fontSize: 10.5, fontWeight: 700 }}>TOTAL</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {allocLegend.map((l) => (
                  <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
                    <span style={{ fontSize: 13, fontWeight: 600, width: 52 }}>{l.name}</span>
                    <span style={{ fontWeight: 800, fontSize: 13, fontFeatureSettings: "'tnum'" }}>{l.pct}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 18, fontSize: 12, color: C.muted, lineHeight: 1.6, borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: 14 }}>
              A discipline & planning tool — no live market data, no returns advice. Just you, showing up every month.
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
