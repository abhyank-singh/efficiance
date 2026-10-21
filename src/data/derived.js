// Derived/demo data shared across screens — ported from the prototype's renderVals().

import { people } from './seed.js'

// Today's schedule; the 3 PM free block converts to Leg Day once claimed.
export function getDayBlocks(blockTaken) {
  return [
    { isEvent: true, time: '9:30 – 9:45', title: 'Daily standup', tag: 'Work', col: 'var(--a1)', bg: 'rgba(var(--a1-rgb),0.14)', bd: 'rgba(var(--a1-rgb),0.45)' },
    { isEvent: true, time: '11:00 – 12:00', title: 'Design review — Q3 launch', tag: 'Work', col: 'var(--a1)', bg: 'rgba(var(--a1-rgb),0.14)', bd: 'rgba(var(--a1-rgb),0.45)' },
    { isEvent: true, time: '13:00 – 13:45', title: 'Lunch + walk', tag: 'Personal', col: 'var(--ok)', bg: 'rgba(var(--a2-rgb),0.13)', bd: 'rgba(var(--a2-rgb),0.4)' },
    { isEvent: true, time: '14:00 – 14:30', title: '1:1 with Priya', tag: 'Work', col: 'var(--a1)', bg: 'rgba(var(--a1-rgb),0.14)', bd: 'rgba(var(--a1-rgb),0.45)' },
    blockTaken
      ? { isEvent: true, time: '15:00 – 17:00', title: '🏋️ Leg Day (from free block)', tag: 'Goal-linked', col: 'var(--text)', bg: 'linear-gradient(135deg,rgba(var(--a1-rgb),0.28),rgba(var(--a2-rgb),0.28))', bd: 'rgba(var(--a1-rgb),0.6)' }
      : { isEvent: false, isFree: true, time: '15:00 – 17:00', title: '2h free' },
    { isEvent: true, time: '19:00 – 19:30', title: 'Call Dad 📞', tag: 'Personal', col: 'var(--ok)', bg: 'rgba(var(--a2-rgb),0.13)', bd: 'rgba(var(--a2-rgb),0.4)' },
  ]
}

// People whose check-in cadence has lapsed (unless logged this session).
export function getDueList(peopleLogged) {
  const due = []
  people.forEach((circle) => {
    circle.list.forEach((p) => {
      const logged = peopleLogged[p.id]
      if (!logged && ((p.cad === 'Weekly' && p.d > 7) || (p.cad === 'Monthly' && p.d > 30))) {
        due.push({ name: p.n, group: circle.g })
      }
    })
  })
  return due
}

export const topGoals = [
  { name: 'Q3 launch', pct: '50%', dash: '100' },
  { name: 'Run 10K', pct: '67%', dash: '66' },
  { name: 'Deep Work', pct: '62%', dash: '76' },
]

export const MOODS = ['😄', '🙂', '😐', '😕', '😞']
