import { useApp } from '../store.jsx'
import { C, grad, card, label } from '../theme.js'
import { openQuickAdd } from './QuickAdd.jsx'
import { useNavigate } from 'react-router-dom'

// "Getting started": four quick wins that get a new user to their first real value.
// Completion is derived from the activity log, so it can't drift out of sync.
export default function Checklist() {
  const { s, patch } = useApp()
  const nav = useNavigate()
  const types = new Set((s.activity || []).map((a) => a.type))
  const tasks = [
    { id: 'quickadd', done: types.has('quickadd'), text: 'Tell Quick Add what you did', go: () => openQuickAdd('spent 450 on swiggy, slept 6.5 hours, called mom') },
    { id: 'habit', done: types.has('habit'), text: 'Check off a habit', go: () => nav('/habits') },
    { id: 'spend', done: types.has('spend'), text: 'Log a spend', go: () => openQuickAdd('spent 120 on chai') },
    { id: 'practice', done: types.has('practice'), text: 'Practise guitar for 10 minutes', go: () => nav('/music') },
  ]
  const n = tasks.filter((t) => t.done).length
  if (s.checklistDismissed) return null
  const all = n === tasks.length
  return (
    <div style={{ ...card, borderRadius: 22, padding: '18px 20px', marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={label}>{all ? '🎉 You’re all set' : `Getting started · ${n}/${tasks.length}`}</div>
        <button onClick={() => patch({ checklistDismissed: true })} aria-label="Dismiss getting started" style={{ background: 'none', border: 'none', color: C.muted, fontSize: 13, fontWeight: 700 }}>{all ? 'Done' : 'Hide'}</button>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.07)', marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ width: (n / tasks.length) * 100 + '%', height: '100%', background: grad, borderRadius: 3, transition: 'width 0.5s ease' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 8 }}>
        {tasks.map((t) => (
          <button key={t.id} onClick={t.go} disabled={t.done} className={t.done ? '' : 'bd-hover-teal'} style={{
            display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', borderRadius: 14, padding: '10px 12px', color: C.text,
            background: t.done ? 'rgba(16,185,129,0.08)' : 'rgba(0,0,0,0.03)', border: '1px solid ' + (t.done ? 'rgba(16,185,129,0.3)' : 'rgba(0,0,0,0.07)'), opacity: t.done ? 0.75 : 1,
          }}>
            <span style={{ width: 22, height: 22, borderRadius: 8, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', background: t.done ? grad : 'rgba(0,0,0,0.06)', border: t.done ? 'none' : '1.5px solid rgba(0,0,0,0.13)' }}>{t.done ? '✓' : ''}</span>
            <span style={{ fontSize: 13.5, fontWeight: 600, textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
