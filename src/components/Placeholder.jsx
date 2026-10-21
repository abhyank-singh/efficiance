import { card, label, C } from '../theme.js'

// Temporary screen body shown until the module's build step lands.

export default function Placeholder({ icon, title, step, blurb }) {
  return (
    <div style={{ animation: 'rise 0.25s ease-out' }}>
      <h1 style={{ fontWeight: 800, fontSize: 'clamp(24px,3.4vw,32px)', letterSpacing: -1, margin: '8px 0 20px' }}>{title}</h1>
      <div style={{ ...card, borderRadius: 24, padding: 'clamp(28px,4vw,48px)', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>{icon}</div>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{title} is on the way</div>
        <div style={{ color: C.sub, fontSize: 14, maxWidth: 420, margin: '0 auto' }}>{blurb}</div>
        <div style={{ ...label, marginTop: 18 }}>Arriving in build step {step}</div>
      </div>
    </div>
  )
}
