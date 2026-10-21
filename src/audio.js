import { useEffect, useRef, useState } from 'react'

// Web Audio helpers for the Music module: a drift-free metronome and tuning-reference tones.
let ctx = null
const audio = () => {
  ctx ??= new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function click(time, accent) {
  const c = audio()
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.frequency.value = accent ? 1500 : 1000
  gain.gain.setValueAtTime(accent ? 0.5 : 0.28, time)
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05)
  osc.connect(gain).connect(c.destination)
  osc.start(time)
  osc.stop(time + 0.06)
}

/** Play a plucked-style reference note. */
export function playTone(hz, seconds = 2.2) {
  const c = audio()
  const t = c.currentTime
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'triangle'
  osc.frequency.value = hz
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.45, t + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds)
  osc.connect(gain).connect(c.destination)
  osc.start(t)
  osc.stop(t + seconds + 0.05)
}

/**
 * Metronome using the look-ahead scheduling pattern: a coarse JS timer queues clicks
 * slightly ahead on the audio clock, so timing stays steady even if the UI stutters.
 */
export function useMetronome(bpm, beatsPerBar) {
  const [running, setRunning] = useState(false)
  const [beat, setBeat] = useState(-1)
  const ref = useRef({ next: 0, i: 0, timer: 0, queue: [], raf: 0 })
  const live = useRef({ bpm, beatsPerBar })
  live.current = { bpm, beatsPerBar }

  useEffect(() => {
    if (!running) return undefined
    const r = ref.current
    const c = audio()
    r.next = c.currentTime + 0.06
    r.i = 0
    r.queue = []
    const schedule = () => {
      while (r.next < c.currentTime + 0.12) {
        const { bpm: b, beatsPerBar: n } = live.current
        const idx = r.i % n
        click(r.next, idx === 0)
        r.queue.push({ t: r.next, idx })
        r.next += 60 / b
        r.i += 1
      }
    }
    const paint = () => {
      const now = c.currentTime
      while (r.queue.length && r.queue[0].t <= now) setBeat(r.queue.shift().idx)
      r.raf = requestAnimationFrame(paint)
    }
    schedule()
    r.timer = setInterval(schedule, 25)
    r.raf = requestAnimationFrame(paint)
    return () => { clearInterval(r.timer); cancelAnimationFrame(r.raf); setBeat(-1) }
  }, [running])

  return { running, beat, toggle: () => setRunning((v) => !v), stop: () => setRunning(false) }
}
