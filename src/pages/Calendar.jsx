import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../store.jsx'
import { C, grad, gradTab, card, label } from '../theme.js'
import { getDayBlocks } from '../data/derived.js'
import { longDay, monthDay, dayNum } from '../data/dates.js'

const weekEvents = [
  [{ t: 'Sprint planning', c: '#2563EB' }, { t: 'Gym — Push', c: '#0EA478' }],
  [{ t: '3 meetings', c: '#2563EB' }, { t: 'Learning block', c: '#0EA478' }],
  [{ t: 'Design review', c: '#2563EB' }, { t: 'Gym — Pull', c: '#0EA478' }],
  [{ t: '3 meetings', c: '#2563EB' }, { t: 'Leg Day 3 PM', c: '#0EA478' }], // today
  [{ t: 'Demo day', c: '#2563EB' }],
  [{ t: "Mom's birthday 🎂", c: '#F59E0B' }, { t: 'Long run', c: '#0EA478' }],
  [{ t: 'Weekly review', c: '#0EA478' }],
]
const weekDays = weekEvents.map((events, i) => ({ name: dayNum(i - 3) + (i === 3 ? ' · today' : ''), events }))

function fmtGoogleEvent(e) {
  if (e.allDay) return 'All day'
  const d = new Date(e.start)
  const day = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
  const time = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${day} · ${time}`
}

export default function Calendar() {
  const { s, patch } = useApp()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [view, setView] = useState('day')
  const [google, setGoogle] = useState({ configured: false, connected: false, events: null, error: null, loading: true })

  const justConnected = params.get('google') === 'connected'
  const authError = params.get('google') === 'error'

  useEffect(() => {
    let alive = true
    fetch('/api/google/status')
      .then((r) => r.json())
      .then((st) => {
        if (!alive) return
        if (st.connected) {
          fetch('/api/google/events')
            .then((r) => r.json())
            .then((data) => alive && setGoogle({ ...st, events: data.events || [], error: data.error || null, loading: false }))
            .catch(() => alive && setGoogle({ ...st, events: [], error: 'fetch failed', loading: false }))
        } else {
          setGoogle({ ...st, events: null, error: null, loading: false })
        }
      })
      .catch(() => alive && setGoogle({ configured: false, connected: false, events: null, error: null, loading: false }))
    return () => { alive = false }
  }, [justConnected])

  const scheduleLegDay = () => { patch({ blockTaken: true, workoutOn: true }); nav('/gym') }

  return (
    <div style={{ animation: 'rise 0.25s ease-out' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(24px,3.4vw,32px)', letterSpacing: -1, margin: 0 }}>Calendar</h1>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: 4 }}>
          {[['day', 'Day'], ['week', 'Week']].map(([id, lbl]) => (
            <button key={id} onClick={() => setView(id)} style={{
              background: view === id ? gradTab : 'transparent', border: 'none', borderRadius: 9,
              padding: '8px 18px', color: C.text, fontWeight: 700, fontSize: 13,
            }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(135deg,rgba(59,130,246,0.14),rgba(16,185,129,0.14))', border: '1px solid rgba(34,211,174,0.45)', borderRadius: 16, padding: '14px 18px', marginBottom: 18 }}>
        <span style={{ fontSize: 20 }}>🎂</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>Mom's birthday — {longDay(2).split(',')[0]}, {monthDay(2)}</div>
          <div style={{ color: C.sub, fontSize: 12.5 }}>All-day occasion · from your People module</div>
        </div>
        <button onClick={() => nav('/people')} className="bd-hover-dark" style={{ background: 'rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.1)', color: C.text, padding: '8px 14px', borderRadius: 10, fontWeight: 700, fontSize: 12.5 }}>
          Gift idea →
        </button>
      </div>

      {view === 'day' && (
        <div style={{ ...card, padding: 24 }}>
          <div style={{ ...label, marginBottom: 16 }}>{longDay(0)}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {getDayBlocks(s.blockTaken).map((b, i) =>
              b.isEvent ? (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, background: b.bg, border: '1px solid ' + b.bd, borderRadius: 14, padding: '14px 16px', transition: 'all 0.15s ease' }}>
                  <span style={{ fontFeatureSettings: "'tnum'", fontWeight: 800, fontSize: 13, color: b.col, width: 96, flex: 'none' }}>{b.time}</span>
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 14.5 }}>{b.title}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: b.col, background: 'rgba(0,0,0,0.045)', borderRadius: 999, padding: '4px 10px' }}>{b.tag}</span>
                </div>
              ) : (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(0,0,0,0.022)', border: '1.5px dashed rgba(34,211,174,0.45)', borderRadius: 14, padding: '14px 16px', flexWrap: 'wrap' }}>
                  <span style={{ fontFeatureSettings: "'tnum'", fontWeight: 800, fontSize: 13, color: C.greenDeep, width: 96, flex: 'none' }}>{b.time}</span>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 13.5, color: C.sub, minWidth: 160 }}>✨ {b.title} — Leg Day 🏋️ or Read 20 pages 📖?</span>
                  <button onClick={scheduleLegDay} className="lift" style={{ background: grad, border: 'none', color: '#fff', padding: '9px 16px', borderRadius: 999, fontWeight: 800, fontSize: 12.5 }}>
                    Schedule Leg Day
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {view === 'week' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
            {weekDays.map((d) => (
              <div key={d.name} style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.085)', borderTopColor: 'rgba(0,0,0,0.05)', borderRadius: 16, padding: 14, minHeight: 150 }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: C.sub, marginBottom: 10 }}>{d.name}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {d.events.map((e) => (
                    <div key={e.t} style={{ borderLeft: '3px solid ' + e.c, background: 'rgba(0,0,0,0.04)', borderRadius: 8, padding: '7px 9px', fontSize: 11.5, fontWeight: 600, lineHeight: 1.3 }}>
                      {e.t}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: 999, padding: '9px 18px', fontSize: 13, fontWeight: 700, color: C.greenDeep }}>
            🏆 Sunday is meeting-free — protect it
          </div>
        </>
      )}

      {/* ---- Live Google Calendar ---- */}
      <div style={{ ...card, marginTop: 18, padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: google.connected ? 14 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>🗓</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>
                Google Calendar
                {google.connected && <span style={{ marginLeft: 8, color: C.greenDeep, fontSize: 12 }}>● Live</span>}
              </div>
              <div style={{ color: C.muted, fontSize: 12, fontWeight: 600 }}>
                {google.connected ? 'Your real events, next 7 days' : google.configured ? 'Connect to pull your real events in live' : 'Needs a one-time Google setup — ask Claude for the steps'}
              </div>
            </div>
          </div>
          {!google.connected && (
            <a href="/api/google/auth" style={{ textDecoration: 'none' }}>
              <button disabled={!google.configured} className={google.configured ? 'lift' : ''} style={{
                background: google.configured ? grad : 'rgba(0,0,0,0.06)', border: 'none',
                color: google.configured ? '#fff' : C.muted, padding: '10px 20px', borderRadius: 12,
                fontWeight: 800, fontSize: 13, cursor: google.configured ? 'pointer' : 'not-allowed',
              }}>
                Connect Google Calendar
              </button>
            </a>
          )}
        </div>

        {authError && (
          <div style={{ marginTop: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '10px 13px', fontSize: 12.5, color: C.amber, fontWeight: 600 }}>
            Google connection didn't complete — the demo events above still have you covered. Try again anytime.
          </div>
        )}

        {google.connected && google.loading && <div style={{ color: C.muted, fontSize: 13 }}>Loading your events…</div>}

        {google.connected && google.events && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {google.events.length === 0 && <div style={{ color: C.sub, fontSize: 13 }}>No events in the next 7 days — enjoy the calm 🌿</div>}
            {google.events.map((e) => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(59,130,246,0.07)', borderLeft: '3px solid #2563EB', borderRadius: 10, padding: '10px 13px' }}>
                <span style={{ fontWeight: 800, fontSize: 12, color: C.blue, fontFeatureSettings: "'tnum'", width: 130, flex: 'none' }}>{fmtGoogleEvent(e)}</span>
                <span style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{e.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
