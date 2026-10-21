import { useEffect, useRef, useState } from 'react'
import { reducedMotion } from '../motion.js'

/**
 * Animates the number inside a formatted string: "₹14,250" → counts up; "57%", "6.7h", "12 days" work too.
 * Re-animates from the previous value when `text` changes. Non-numeric text is shown as is.
 */
export default function CountUp({ text, ms = 900 }) {
  const m = String(text).match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/s)
  const target = m ? Number(m[2].replace(/,/g, '')) : NaN
  const decimals = m && m[2].includes('.') ? m[2].split('.')[1].length : 0
  const comma = m ? m[2].includes(',') : false
  const [val, setVal] = useState(reducedMotion() || Number.isNaN(target) ? target : 0)
  const from = useRef(0)

  useEffect(() => {
    if (Number.isNaN(target)) return undefined
    if (reducedMotion()) { setVal(target); return undefined }
    const start = performance.now()
    const a = from.current
    let raf = 0
    const tick = (t) => {
      const k = Math.min(1, (t - start) / ms)
      const e = 1 - Math.pow(1 - k, 3) // ease-out
      setVal(a + (target - a) * e)
      if (k < 1) raf = requestAnimationFrame(tick)
      else from.current = target
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])

  if (!m) return <>{text}</>
  const n = decimals ? val.toFixed(decimals) : Math.round(val)
  const shown = comma ? Number(n).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : String(n)
  return (
    <>
      <span aria-hidden="true">{m[1]}{shown}{m[3]}</span>
      <span className="sr-only">{String(text)}</span>
    </>
  )
}
