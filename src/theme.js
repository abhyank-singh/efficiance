// Design tokens — extracted verbatim from the Claude Design prototype (Efficiance.dc.html).
// The prototype is the source of truth; change values there first.

export const C = {
  bg: '#E9EDF3',
  text: '#16181D',
  sub: '#5B6472',
  muted: '#5F6B7D',
  blue: '#1D4ED8',
  blueBright: '#3B82F6',
  green: '#12B981',
  greenDeep: '#0B7F5C',
  emerald: '#10B981',
  amber: '#B45309',
}

export const grad = 'linear-gradient(135deg,#2563EB,#12B981)'
export const gradSoft = 'linear-gradient(135deg,rgba(59,130,246,0.32),rgba(16,185,129,0.32))'
export const gradTab = 'linear-gradient(135deg,rgba(59,130,246,0.35),rgba(16,185,129,0.35))'

export const auroraBg = {
  minHeight: '100vh',
  position: 'relative',
  overflowX: 'hidden',
  background:
    'radial-gradient(1200px 780px at 84% -14%,#DEEAFF 0%,rgba(233,237,243,0) 52%),' +
    'radial-gradient(1000px 660px at 2% 108%,#D8F1E6 0%,rgba(233,237,243,0) 58%),' +
    'linear-gradient(170deg,#EDF0F5 0%,#E2E7EF 100%)',
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
  background: 'rgba(0,0,0,0.045)',
  border: '1px solid rgba(0,0,0,0.09)',
  color: C.text,
  padding: '10px 18px',
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 13,
}

export const gradBtn = {
  background: grad,
  border: 'none',
  color: '#fff',
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
