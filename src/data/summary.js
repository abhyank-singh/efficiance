// Assembles a compact plain-text summary of the user's tracked data across all
// modules. Sent to the backend → OpenAI so insights are grounded in real numbers.

import { habits as habitDefs, breakHabits, people, budgets, subs, sips, sleep, journal as seedJournal } from './seed.js'

export function buildDataSummary(s) {
  const lines = []

  // Habits
  const habitStatus = habitDefs.map((h) => {
    const st = s.habitState[h.id]
    return `${h.name} (${h.cat}): ${st.streak}-day streak, today ${st.done ? 'done' : 'not done'}`
  })
  lines.push('HABITS (building):\n' + habitStatus.join('\n'))

  // Break habits with current slip counts
  const breakStatus = breakHabits.map((b) => `${b.name}: was ${b.from}/wk, now ${s.slips[b.id]}/wk (${b.pattern})`)
  lines.push('\nHABITS (breaking):\n' + breakStatus.join('\n'))

  // Sleep
  const avg = (sleep.reduce((a, d) => a + d.h, 0) / sleep.length).toFixed(1)
  lines.push('\nSLEEP (last 7 nights, hours):\n' + sleep.map((d) => `${d.label} ${d.h}`).join(', ') + `\nAverage ${avg}h vs 8h target.`)

  // Finance — budgets + this week's spend + subs
  const budgetLines = budgets.map((b) => `${b.cat}: ₹${b.spent} of ₹${b.cap} (${Math.round((b.spent / b.cap) * 100)}%)`)
  lines.push('\nBUDGETS this month:\n' + budgetLines.join('\n'))
  const todayTotal = s.txToday.reduce((a, t) => a + t.a, 0)
  lines.push(`\nToday's spend so far: ₹${todayTotal}. Subscriptions: ${subs.map((x) => x.name + ' ' + x.amt).join(', ')} (grew ₹450/mo this quarter).`)

  // SIPs
  lines.push('\nINVESTMENTS: ' + sips.map((x) => `${x.fund} ${x.amt}/mo (invested ${x.total})`).join('; '))

  // People — contact recency
  const peopleLines = []
  people.forEach((c) => {
    c.list.forEach((p) => {
      const logged = s.peopleLogged[p.id]
      peopleLines.push(`${p.n} (${c.g}, ${p.cad}): last contact ${logged ? '0' : p.d}d ago`)
    })
  })
  lines.push('\nPEOPLE (contact recency):\n' + peopleLines.join('\n'))

  // Journal moods
  const entries = s.journalEntries || seedJournal
  lines.push('\nRECENT MOODS (journal):\n' + entries.map((j) => `${j.date}: ${j.mood} "${j.text}"`).join('\n'))

  // Calendar context
  lines.push('\nCALENDAR: Today has 3 meetings + a 2h free block at 3PM. Gym completion is higher for morning sessions. Mom\'s birthday in 2 days.')

  return lines.join('\n')
}
