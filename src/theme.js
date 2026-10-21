// Design tokens — extracted verbatim from the Claude Design prototype (Efficiance.dc.html).
// The prototype is the source of truth; change values there first.

// All colours are CSS variables defined in styles.css (:root). To re-skin the app, edit that one block.
export const C = {
  bg: 'var(--bg)',
  text: 'var(--text)',
  sub: 'var(--sub)',
  muted: 'var(--muted)',
  blue: 'var(--a1)',            // primary accent (text/links)
  blueBright: 'var(--a1-bright)',
  green: 'var(--a2-deep)',
  greenDeep: 'var(--ok)',       // positive/OK text
  emerald: 'var(--a2-deep)',
  amber: 'var(--warn)',
}

// Brand gradient for fills that carry white text (buttons, avatars, progress bars).
export const grad = 'linear-gradient(135deg,var(--a1),var(--a2-deep))'
export const gradSoft = 'linear-gradient(135deg,rgba(var(--a1-rgb),0.30),rgba(var(--a2-rgb),0.34))'
export const gradTab = 'linear-gradient(135deg,rgba(var(--a1-rgb),0.32),rgba(var(--a2-rgb),0.36))'

// Glass: translucent, blurred, with a bright top edge. Primary = tinted glass, secondary = frosted white.
export const glassPrimary = {
  background: 'linear-gradient(135deg,rgba(var(--a1-rgb),0.92),rgba(var(--a2d-rgb),0.88))',
  border: '1px solid rgba(255,255,255,0.55)',
  color: '#fff',
  textShadow: '0 1px 1px rgba(0,0,0,0.18)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45), 0 10px 26px rgba(var(--a1-rgb),0.28)',
  backdropFilter: 'blur(10px) saturate(150%)',
  WebkitBackdropFilter: 'blur(10px) saturate(150%)',
}
export const glassSoft = {
  background: 'rgba(255,255,255,0.58)',
  border: '1px solid rgba(255,255,255,0.85)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.95), 0 6px 18px rgba(20,50,40,0.10)',
  backdropFilter: 'blur(12px) saturate(160%)',
  WebkitBackdropFilter: 'blur(12px) saturate(160%)',
}

export const auroraBg = {
  minHeight: '100vh',
  position: 'relative',
  overflowX: 'hidden',
  background:
    'radial-gradient(1200px 780px at 84% -14%,var(--aurora-1) 0%,rgba(238,244,238,0) 52%),' +
    'radial-gradient(1000px 660px at 2% 108%,var(--aurora-2) 0%,rgba(238,244,238,0) 58%),' +
    'linear-gradient(170deg,var(--bg-top) 0%,var(--bg-bottom) 100%)',
  animation: 'rise 0.25s ease-out',
}

export const card = {
  background: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.09)',
  borderTopColor: 'rgba(0,0,0,0.05)',
  borderRadius: 22,
  boxShadow: '0 1px 2px rgba(16,24,40,0.05),0 10px 30px rgba(16,24,40,0.08)',
}

export const label = {
  fontSize: 11,
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: C.muted,
  fontWeight: 700,
}

export const pillBtn = {
  ...glassSoft,
  color: C.text,
  padding: '10px 18px',
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 13,
}

export const gradBtn = {
  ...glassPrimary,
  fontWeight: 800,
}

export const inputStyle = {
  width: '100%',
  background: 'rgba(0,0,0,0.04)',
  border: '1px solid rgba(0,0,0,0.09)',
  borderRadius: 12,
  padding: 12,
  color: C.text,
  fontSize: 13.5,
}
