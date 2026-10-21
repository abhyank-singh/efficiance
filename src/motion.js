// Motion helpers. Everything here respects "reduce motion" and ignores touch input.
export const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** 3D tilt: any element with class "card-hover" leans toward the pointer. Wide cards tilt less. */
export function initTilt() {
  if (reducedMotion()) return
  let cur = null
  const reset = (el) => { if (el) { el.style.transform = ''; el.style.transition = '' } }
  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return
    const el = e.target.closest?.('.card-hover') || null
    if (el !== cur) { reset(cur); cur = el }
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    const k = Math.min(1, 420 / r.width) * 6 // max ~6° on small cards, less on wide ones
    el.style.transition = 'transform 0.08s ease-out'
    el.style.transform = `perspective(900px) rotateX(${(-y * k).toFixed(2)}deg) rotateY(${(x * k).toFixed(2)}deg) translateY(-2px)`
  }, { passive: true })
  document.addEventListener('pointerleave', () => { reset(cur); cur = null }, true)
}
