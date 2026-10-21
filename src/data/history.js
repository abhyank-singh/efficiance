// Sample history for the demo: 12 weeks of plausible daily numbers (deterministic, so it never "jumps").
// Today's values are merged in live from app state, so what you do now shows up in the Recap.
import { todayKey } from './actions.js'
import { MOODS } from '../../shared/schema.js'
import { practiceSeed } from './music.js'

const rng = (seed) => () => { // mulberry32
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const DAY = 86400000
const WEEKS = 12

/** Days oldest → newest, ending with today (84 entries). */
export function buildHistory(s) {
  const r = rng(20240611)
  const out = []
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const total = WEEKS * 7
  for (let i = total - 1; i >= 1; i--) {
    const d = new Date(today.getTime() - i * DAY)
    const dow = (d.getDay() + 6) % 7 // Mon = 0
    const weekend = dow >= 5
    const trend = (total - i) / total // gets a little better over time
    const habits = Math.max(0, Math.min(5, Math.round(2 + trend * 1.6 + (weekend ? -0.8 : 0.4) + (r() - 0.5) * 3)))
    out.push({
      date: d, habits,
      spend: Math.round((weekend ? 900 : 520) * (0.55 + r() * 1.1)),
      sleep: Math.round((6.2 + trend * 0.7 + (weekend ? 0.7 : 0) + (r() - 0.5) * 1.6) * 10) / 10,
      practice: i <= 6 ? practiceSeed[6 - i] ?? 0 : r() < 0.35 + trend * 0.3 ? Math.round((15 + r() * 30) / 5) * 5 : 0,
      workout: r() < 0.38 + trend * 0.2 && !(dow === 6),
      mood: Math.max(1, Math.min(5, Math.round(3.3 + (r() - 0.5) * 2.2 - (dow === 6 ? 0.8 : 0)))),
    })
  }
  // today = live
  const key = todayKey()
  const moodScore = s.mood ? 5 - MOODS.indexOf(s.mood) : 4
  out.push({
    date: today,
    habits: Object.values(s.habitState).filter((h) => h.done).length,
    spend: s.txToday.reduce((a, t) => a + t.a, 0),
    sleep: s.sleepToday ?? 6.2,
    practice: s.practice.log.filter((e) => e.date === key).reduce((a, e) => a + e.min, 0),
    workout: (s.workouts || []).some((w) => w.date === key),
    mood: moodScore,
  })
  return out
}

export const score = (d) => d.habits + (d.practice > 0 ? 1 : 0) + (d.workout ? 1 : 0) // 0..7
export const level = (d) => { const v = score(d); return v === 0 ? 0 : v <= 2 ? 1 : v <= 4 ? 2 : v <= 5 ? 3 : 4 }

const sum = (a, f) => a.reduce((x, d) => x + f(d), 0)

export function summarize(days) {
  const n = days.length
  const strong = days.map((d) => d.habits >= 3)
  let best = 0, run = 0
  for (const ok of strong) { run = ok ? run + 1 : 0; best = Math.max(best, run) }
  const byDow = Array(7).fill(0).map(() => ({ n: 0, sc: 0 }))
  days.forEach((d) => { const k = (d.date.getDay() + 6) % 7; byDow[k].n++; byDow[k].sc += score(d) })
  const dowNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const bestDow = byDow.map((x, i) => ({ i, avg: x.n ? x.sc / x.n : 0 })).sort((a, b) => b.avg - a.avg)[0].i
  const weeks = []
  for (let w = 0; w < Math.floor(n / 7); w++) {
    const chunk = days.slice(n - (w + 1) * 7, n - w * 7)
    weeks.unshift({
      sleep: sum(chunk, (d) => d.sleep) / 7, spend: sum(chunk, (d) => d.spend),
      practice: sum(chunk, (d) => d.practice), habits: sum(chunk, (d) => d.habits) / 35, score: sum(chunk, score),
    })
  }
  const bestWeek = weeks.reduce((bi, w, i) => (w.score > weeks[bi].score ? i : bi), 0)
  return {
    n, weeks, bestWeek, bestStreak: best, bestDay: dowNames[bestDow],
    consistency: Math.round((sum(days, (d) => d.habits) / (5 * n)) * 100),
    avgSleep: sum(days, (d) => d.sleep) / n,
    spend: sum(days, (d) => d.spend), perDay: Math.round(sum(days, (d) => d.spend) / n),
    workouts: days.filter((d) => d.workout).length, practice: sum(days, (d) => d.practice),
    mood: sum(days, (d) => d.mood) / n,
  }
}
