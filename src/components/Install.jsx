import { useState } from 'react'
import { usePwaInstall } from '../pwa.js'
import { C, grad } from '../theme.js'

// "Install as an app": one-tap on Chrome/Edge/Android, a short how-to on iPhone/Safari.
export function InstallCard({ style }) {
  const pwa = usePwaInstall()
  const [help, setHelp] = useState(false)
  if (pwa.installed) {
    return <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 18, padding: '14px 18px', marginBottom: 22, fontSize: 13.5, fontWeight: 700, color: C.greenDeep, ...style }}>✓ Running as an installed app</div>
  }
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 18, padding: 18, marginBottom: 22, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', ...style }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: grad, color: '#fff', fontWeight: 800, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>a</div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>Install Efficiance as an app</div>
        <div style={{ color: C.sub, fontSize: 12.5, marginTop: 2 }}>Opens in its own window, works offline, and lives on your home screen or dock.</div>
        {help && (
          <div style={{ marginTop: 10, fontSize: 12.5, color: C.text, lineHeight: 1.6, background: 'rgba(0,0,0,0.04)', borderRadius: 12, padding: '10px 12px' }}>
            {pwa.ios
              ? <>On iPhone/iPad: tap <b>Share</b> (the square with an arrow) → <b>Add to Home Screen</b> → <b>Add</b>.</>
              : <>On Mac Safari: <b>File → Add to Dock</b>. On Chrome/Edge: open the browser menu (⋮) → <b>Install Efficiance</b> (or the install icon in the address bar).</>}
          </div>
        )}
      </div>
      <button
        onClick={() => (pwa.canPrompt ? pwa.install() : setHelp((h) => !h))}
        className="lift" style={{ background: grad, border: 'none', color: '#fff', padding: '11px 20px', borderRadius: 12, fontWeight: 800, fontSize: 13.5, flex: 'none' }}
      >
        {pwa.canPrompt ? 'Install app' : help ? 'Hide steps' : 'How to install'}
      </button>
    </div>
  )
}
