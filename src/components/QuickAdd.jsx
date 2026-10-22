import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp, useMobile } from '../store.jsx'
import { C, grad, label, glassPrimary } from '../theme.js'
import { understand, applyActions, describe, MODULE_ROUTE, EXAMPLES } from '../data/actions.js'
import { track } from '../track.js'

// In-app assistant: type or say what you did → see exactly what will change → confirm → undo if wrong.

export const openQuickAdd = (prefill = '') => window.dispatchEvent(new CustomEvent('efficiance:quickadd', { detail: { prefill } }))

const isMac = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent)
export const HOTKEY = isMac ? '⌘K' : 'Ctrl K'

/** A search-bar-looking button that opens Quick Add (used on Today and in the sidebar). */
export function QuickBar({ compact }) {
  const mobile = useMobile()
  return (
    <button onClick={() => openQuickAdd()} className="lift" style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
      background: '#fff', border: '1px solid rgba(var(--a1-rgb),0.28)', borderRadius: compact ? 12 : 16,
      padding: compact ? '10px 12px' : '14px 18px', color: C.sub, fontSize: compact ? 12.5 : 14.5, fontWeight: 600,
      boxShadow: compact ? 'none' : '0 4px 18px rgba(var(--a1-rgb),0.10)',
    }}>
      <span style={{ fontSize: compact ? 15 : 18 }}>✨</span>
      <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {compact ? 'Quick Add' : 'Tell me what you did… “spent 450 on swiggy, slept 6.5h, called mom”'}
      </span>
      {!mobile && <kbd style={{ fontFamily: 'inherit', fontSize: 11, fontWeight: 700, color: C.muted, border: '1px solid rgba(0,0,0,0.12)', borderRadius: 6, padding: '2px 6px', flex: 'none' }}>{HOTKEY}</kbd>}
    </button>
  )
}

export default function QuickAdd() {
  const { s, patch } = useApp()
  const nav = useNavigate()
  const mobile = useMobile()
  const [params, setParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [phase, setPhase] = useState('idle') // idle | thinking | review
  const [res, setRes] = useState(null)
  const [off, setOff] = useState(new Set()) // indexes the user un-ticked
  const [toast, setToast] = useState(null)
  const [listening, setListening] = useState(false)
  const recRef = useRef(null)
  const toastTimer = useRef(null)

  const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

  const close = () => { setOpen(false); setPhase('idle'); setRes(null); setText(''); setOff(new Set()); stopVoice() }
  const show = (prefill = '') => { setOpen(true); setPhase('idle'); setRes(null); setOff(new Set()); setText(prefill); track('quickadd_open') }

  useEffect(() => {
    const onEvt = (e) => show(e.detail?.prefill || '')
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open ? close() : show() }
      if (e.key === 'Escape' && open) close()
    }
    window.addEventListener('efficiance:quickadd', onEvt)
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('efficiance:quickadd', onEvt); window.removeEventListener('keydown', onKey) }
  })

  // PWA shortcut / deep link: /today?quickadd=1
  useEffect(() => {
    if (params.get('quickadd')) { show(); params.delete('quickadd'); setParams(params, { replace: true }) }
  }, [])

  const submit = async (value = text) => {
    const t = value.trim()
    if (!t) return
    setPhase('thinking')
    track('quickadd_submit')
    const r = await understand(t)
    setRes(r)
    setOff(new Set())
    setPhase('review')
    track('quickadd_source_' + r.source)
  }

  const chosen = res ? res.actions.filter((_, i) => !off.has(i)) : []

  const apply = () => {
    if (!chosen.length) return
    const { patch: p, undo } = applyActions(s, chosen)
    patch(p)
    track('quickadd_apply')
    const modules = [...new Set(chosen.map((a) => describe(a).module))]
    clearTimeout(toastTimer.current)
    setToast({ n: chosen.length, modules, undo })
    toastTimer.current = setTimeout(() => setToast(null), 8000)
    close()
  }

  const undo = () => { if (toast) { patch(toast.undo); track('quickadd_undo'); setToast(null) } }

  function stopVoice() { try { recRef.current?.stop() } catch { /* ignore */ } setListening(false) }
  const toggleVoice = () => {
    if (listening) return stopVoice()
    const rec = new SR()
    rec.lang = 'en-IN'
    rec.interimResults = true
    rec.onresult = (e) => setText(Array.from(e.results).map((r) => r[0].transcript).join(' '))
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recRef.current = rec
    rec.start()
    setListening(true)
    track('quickadd_voice')
  }

  const srcBadge = res && ({
    instant: ['⚡ Understood instantly', C.greenDeep, 'rgba(var(--a2-rgb),0.12)'],
    ai: ['✨ Understood by AI', C.blue, 'rgba(var(--a1-rgb),0.10)'],
    none: ['🤔 Not sure', C.amber, 'rgba(245,158,11,0.12)'],
    down: ['⚠️ AI unavailable', C.amber, 'rgba(245,158,11,0.12)'],
  })[res.source === 'none' && (res.ai === 'down' || res.ai === 'offline') ? 'down' : res.source]

  return (
    <>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Quick Add" onClick={close} style={{
          position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(17,24,39,0.42)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: mobile ? 'flex-end' : 'flex-start', justifyContent: 'center', padding: mobile ? 0 : '12vh 16px 0',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: '100%', maxWidth: 580, background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: mobile ? '24px 24px 0 0' : 24, boxShadow: '0 30px 80px rgba(16,24,40,0.28)',
            padding: 'clamp(18px,3vw,26px)', paddingBottom: mobile ? 'calc(22px + env(safe-area-inset-bottom))' : undefined,
            animation: 'rise 0.2s ease-out', maxHeight: mobile ? '90vh' : '76vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 17 }}>✨ Quick Add</div>
              <button aria-label="Close" onClick={close} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: 10, width: 30, height: 30, color: C.sub }}>✕</button>
            </div>

            <div style={{ position: 'relative' }}>
              <textarea
                autoFocus value={text} rows={3} maxLength={500}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
                placeholder="What did you do today? e.g. “spent 450 on swiggy, slept 6.5 hours, called mom”"
                aria-label="Tell Efficiance what you did"
                style={{ width: '100%', resize: 'none', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 14, padding: '14px 52px 14px 16px', fontSize: 15, lineHeight: 1.5, color: C.text }}
              />
              {SR && (
                <button onClick={toggleVoice} aria-label={listening ? 'Stop listening' : 'Speak'} style={{
                  position: 'absolute', right: 10, top: 10, width: 36, height: 36, borderRadius: '50%', border: 'none',
                  background: listening ? '#EF4444' : 'rgba(var(--a1-rgb),0.1)', color: listening ? '#fff' : C.blue, fontSize: 16,
                  animation: listening ? 'glowpulse 1.2s ease-in-out infinite' : 'none',
                }}>🎙</button>
              )}
            </div>

            {phase === 'idle' && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                {EXAMPLES.slice(0, 4).map((ex) => (
                  <button key={ex} onClick={() => { setText(ex); submit(ex) }} className="bd-hover" style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 999, padding: '7px 12px', fontSize: 12, color: C.sub, fontWeight: 600, textAlign: 'left' }}>
                    {ex}
                  </button>
                ))}
              </div>
            )}

            {phase === 'thinking' && <div style={{ marginTop: 16, color: C.sub, fontSize: 13.5, fontWeight: 600 }}>Reading that…</div>}

            {phase === 'review' && res && (
              <div style={{ marginTop: 16, animation: 'rise 0.2s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{ ...label, color: C.sub }}>Here’s what I’ll do</span>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: srcBadge[1], background: srcBadge[2], borderRadius: 999, padding: '3px 10px' }}>{srcBadge[0]}</span>
                </div>

                {res.actions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {res.actions.map((a, i) => {
                      const d = describe(a)
                      const on = !off.has(i)
                      return (
                        <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: on ? 'rgba(var(--a2-rgb),0.07)' : 'rgba(0,0,0,0.03)', border: '1px solid ' + (on ? 'rgba(var(--a2-rgb),0.3)' : 'rgba(0,0,0,0.07)'), borderRadius: 14, padding: '11px 14px', cursor: 'pointer', opacity: on ? 1 : 0.55 }}>
                          <input type="checkbox" checked={on} onChange={() => setOff((o) => { const n = new Set(o); n.has(i) ? n.delete(i) : n.add(i); return n })} style={{ width: 17, height: 17, accentColor: 'var(--ok)' }} />
                          <span style={{ fontSize: 20 }}>{d.icon}</span>
                          <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{d.text}</span>
                          <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', color: C.muted }}>{d.module}</span>
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 14, padding: 14, fontSize: 13.5, lineHeight: 1.55 }}>
                    {res.ai === 'down' && <>The AI helper couldn’t be reached just now, so I could only use instant parsing. Instant parsing handles sentences like “spent 450 on swiggy” or “slept 7 hours”. Try again in a minute for anything more free-form.</>}
                    {res.ai === 'offline' && <>You appear to be offline, so only instant parsing is available. Try “spent 450 on swiggy” or “slept 7 hours”.</>}
                    {res.ai === 'limited' && <>{res.note || 'The AI helper is at its demo limit for now.'} Instant parsing still works for sentences like “spent 450 on swiggy”.</>}
                    {res.ai === 'no_key' && <>The AI helper isn’t configured on this server. Instant parsing still works for sentences like “spent 450 on swiggy”.</>}
                    {res.ai === 'empty' && <>{res.note || 'I couldn’t find anything to log in that.'} I can record spends, habits, sleep, water, mood, journal lines, people check-ins, guitar practice and workouts.</>}
                    {!['down', 'offline', 'limited', 'no_key', 'empty'].includes(res.ai) && <>I couldn’t turn that into anything I can log. I can record spends, habits, sleep, water, mood, journal lines, people check-ins, guitar practice and workouts. Try one of the examples.</>}
                  </div>
                )}

                {res.unmatched.length > 0 && res.actions.length > 0 && (
                  <div style={{ marginTop: 10, fontSize: 12.5, color: C.sub }}>Skipped (not understood): {res.unmatched.map((u) => `“${u}”`).join(', ')}</div>
                )}
                {res.actions.length > 0 && res.ai === 'down' && <div style={{ marginTop: 10, fontSize: 12.5, color: C.sub }}>The AI helper is unavailable right now, so only instant parsing was used.</div>}
                {res.actions.length > 0 && res.ai === 'limited' && res.note && <div style={{ marginTop: 10, fontSize: 12.5, color: C.sub }}>{res.note}</div>}
                {res.actions.length > 0 && res.offline && <div style={{ marginTop: 10, fontSize: 12.5, color: C.sub }}>Offline: only instant parsing is available.</div>}

                <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
                  <button onClick={() => setPhase('idle')} style={{ background: 'transparent', border: 'none', color: C.sub, fontWeight: 700, fontSize: 14, padding: '10px 14px' }}>Edit</button>
                  <button onClick={apply} disabled={!chosen.length} className={chosen.length ? 'lift' : ''} style={{ ...glassPrimary, padding: '12px 22px', borderRadius: 14, fontWeight: 800, fontSize: 14.5, opacity: chosen.length ? 1 : 0.45, boxShadow: '0 6px 20px rgba(var(--a2-rgb),0.3)' }}>
                    Apply {chosen.length || ''} change{chosen.length === 1 ? '' : 's'}
                  </button>
                </div>
              </div>
            )}

            {phase !== 'review' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Nothing changes until you confirm.</span>
                <button onClick={() => submit()} disabled={!text.trim() || phase === 'thinking'} className="lift" style={{ ...glassPrimary, padding: '11px 20px', borderRadius: 14, fontWeight: 800, fontSize: 14, opacity: text.trim() ? 1 : 0.5 }}>
                  Understand →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div role="status" style={{
          position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: mobile ? 'calc(96px + env(safe-area-inset-bottom))' : 28, zIndex: 90,
          background: 'var(--text)', color: '#fff', borderRadius: 16, padding: '12px 14px 12px 18px', display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: '0 12px 40px rgba(0,0,0,0.3)', fontSize: 13.5, fontWeight: 600, animation: 'rise 0.25s ease-out', maxWidth: 'calc(100vw - 24px)',
        }}>
          <span>✓ Updated {toast.modules.join(', ')}</span>
          <button onClick={() => { nav(MODULE_ROUTE[toast.modules[0]] || '/today'); setToast(null) }} style={{ background: 'none', border: 'none', color: '#86EFAC', fontWeight: 800, fontSize: 13 }}>View</button>
          <button onClick={undo} style={{ background: 'rgba(255,255,255,0.14)', border: 'none', color: '#fff', fontWeight: 800, fontSize: 13, borderRadius: 10, padding: '7px 12px' }}>Undo</button>
        </div>
      )}
    </>
  )
}
