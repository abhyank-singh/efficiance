// Quick Add engine: parse a sentence → actions → preview → apply to app state (with undo).
// Two parsers: an instant local one (works offline, costs nothing) and the AI one (server).
// Every action, from either parser, goes through sanitizeActions() before it can touch state.

import { sanitizeActions, PEOPLE, MOODS } from '../../shared/schema.js'
import { journal as seedJournal } from './seed.js'
import { shortDay } from './dates.js'

export const todayKey = () => new Date().toISOString().slice(0, 10)

/* ───────────── presentation ───────────── */

const CAT_ICON = { Food: '🍔', Transport: '🛺', Groceries: '🛒', Entertainment: '🎬', Shopping: '🛍', Health: '💊', Other: '🧾' }
const HABIT_LABEL = { med: 'Meditate 10 min', read: 'Read 20 pages', water: 'Drink 3L water', steps: '8,000 steps', phone: 'No-phone breakfast' }
const SLIP_LABEL = { scroll: 'Late-night scrolling', junk: 'Junk food order', late: 'Slept past 12:30 AM' }

/** Human-readable preview line for one action. */
export function describe(a) {
  switch (a.type) {
    case 'spend': return { icon: CAT_ICON[a.category], module: 'Finance', text: `Log ₹${a.amount.toLocaleString('en-IN')} · ${a.payee} (${a.category})` }
    case 'habit': return { icon: '✅', module: 'Habits', text: `Check off “${HABIT_LABEL[a.id]}”` }
    case 'slip': return { icon: '📉', module: 'Habits', text: `Note a slip: ${SLIP_LABEL[a.id]}` }
    case 'sleep': return { icon: '😴', module: 'Sleep', text: `Record ${a.hours}h of sleep` }
    case 'water': return { icon: '💧', module: 'Health', text: `Add ${a.cups} glass${a.cups > 1 ? 'es' : ''} of water` }
    case 'journal': return { icon: '📓', module: 'Journal', text: `Journal: “${a.text}”` }
    case 'mood': return { icon: a.mood, module: 'Journal', text: 'Set today’s mood' }
    case 'people': return { icon: '🌱', module: 'People', text: `Check in with ${PEOPLE[a.id]}` }
    case 'practice': return { icon: '🎸', module: 'Music', text: `Practice: ${a.minutes} min · ${a.topic}` }
    case 'workout': return { icon: '🏋️', module: 'Gym', text: `Workout: ${a.name}` }
    case 'priority': return { icon: '🎯', module: 'Today', text: `Tomorrow’s #1: ${a.text}` }
    default: return { icon: '•', module: '', text: '' }
  }
}

export const MODULE_ROUTE = { Finance: '/finance', Habits: '/habits', Sleep: '/gym', Health: '/gym', Journal: '/journal', People: '/people', Music: '/music', Gym: '/gym', Today: '/today' }

/* ───────────── apply (pure: state in → patch out) ───────────── */

function applyOne(st, a) {
  switch (a.type) {
    case 'spend':
      return { txToday: st.txToday.concat([{ p: a.payee, i: CAT_ICON[a.category], c: a.category, a: a.amount }]) }
    case 'habit': {
      const cur = st.habitState[a.id]
      return { habitState: { ...st.habitState, [a.id]: { done: true, streak: cur.done ? cur.streak : cur.streak + 1 } } }
    }
    case 'slip':
      return { slips: { ...st.slips, [a.id]: st.slips[a.id] + 1 } }
    case 'sleep':
      return { sleepToday: a.hours }
    case 'water':
      return { waterCups: Math.min(8, st.waterCups + a.cups) }
    case 'journal': {
      const entries = st.journalEntries || seedJournal
      return {
        journalLine: a.text,
        mood: a.mood || st.mood,
        journalEntries: [{ date: shortDay(0), mood: a.mood || st.mood || '🙂', text: a.text }, ...entries.filter((e) => e.date !== shortDay(0))],
      }
    }
    case 'mood':
      return { mood: a.mood }
    case 'people':
      return { peopleLogged: { ...st.peopleLogged, [a.id]: true } }
    case 'practice':
      return { practice: { ...st.practice, log: st.practice.log.concat([{ date: todayKey(), min: a.minutes, topic: a.topic, src: 'quick' }]) } }
    case 'workout':
      return { workouts: (st.workouts || []).concat([{ date: todayKey(), name: a.name }]) }
    case 'priority':
      return { priority: a.text }
    default:
      return {}
  }
}

/**
 * Apply actions to state. Returns { patch, undo } where `undo` restores every key the patch touched.
 * Also appends to the activity log (used for Recap, onboarding checklist and metrics).
 */
export function applyActions(st, actions) {
  let cur = st
  const patch = {}
  for (const a of sanitizeActions(actions)) {
    const p = applyOne(cur, a)
    Object.assign(patch, p)
    cur = { ...cur, ...p }
  }
  const t = Date.now()
  patch.activity = [...(st.activity || []), { t, type: 'quickadd' }, ...actions.map((a) => ({ t, type: a.type }))].slice(-500)
  const undo = Object.fromEntries(Object.keys(patch).map((k) => [k, st[k]]))
  return { patch, undo }
}

/* ───────────── instant local parser ───────────── */

const num = '(\\d[\\d,]*(?:\\.\\d+)?)'
const toNum = (s) => Number(String(s).replace(/,/g, ''))

const CATEGORY_WORDS = [
  ['Food', /swiggy|zomato|food|lunch|dinner|breakfast|chai|tea|coffee|cafe|café|restaurant|snack|pizza|biryani|meal|dominos|starbucks/],
  ['Transport', /auto|uber|ola|cab|taxi|metro|bus|fuel|petrol|diesel|train|rapido|parking|toll/],
  ['Groceries', /grocer|kirana|bigbasket|blinkit|zepto|vegetable|fruits|milk|instamart/],
  ['Entertainment', /netflix|movie|spotify|prime|hotstar|game|concert|cinema|youtube/],
  ['Shopping', /amazon|flipkart|myntra|shopping|clothes|shoes|shirt|jeans/],
  ['Health', /pharmacy|medicine|doctor|clinic|gym fee|hospital|dentist|medic/],
]

const MOOD_WORDS = [
  ['😄', /great|amazing|fantastic|awesome|happy|excited|wonderful|pumped|energi[sz]ed/],
  ['🙂', /good|fine|nice|calm|content|relaxed|better/],
  ['😐', /meh|okay|ok\b|so-so|average|tired|neutral|fine-ish/],
  ['😕', /stressed|anxious|low|worried|down|overwhelmed|sad|bad|off/],
  ['😞', /awful|terrible|horrible|exhausted|miserable|depressed|drained/],
]

const PEOPLE_WORDS = {
  mom: /\b(mom|mum|mother|maa|mummy)\b/, dad: /\b(dad|father|papa|pappa)\b/, riya: /\b(riya|sis|sister)\b/, arjun: /\barjun\b/,
  priya: /\bpriya\b/, dev: /\bdev\b/, rajat: /\brajat\b/, meera: /\bmeera\b/,
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

function parseClause(raw) {
  const c = raw.trim()
  const l = c.toLowerCase()
  if (!l) return null
  let m

  // explicit prefixes first
  if ((m = c.match(/^(?:journal|diary|dear diary|note)\s*[:\-–]\s*(.+)$/i))) return { type: 'journal', text: m[1] }
  if ((m = c.match(/(?:tomorrow'?s?\s+(?:top\s+|#?1\s+)?priority|priority\s+(?:for\s+)?tomorrow)\s*(?:is|:|-)?\s*(.+)$/i))) return { type: 'priority', text: m[1] }

  // spending: needs a verb or currency marker + a number
  if (/\b(spent|paid|bought|cost|ordered|rs\.?|inr|rupees)\b|₹/.test(l) && (m = l.match(new RegExp(`(?:₹|rs\\.?\\s*|inr\\s*)?${num}\\s*(?:rs\\.?|rupees|₹|/-)?`)))) {
    const amount = toNum(m[1])
    if (amount > 0 && !/\b(min|mins|minutes|hours?|hrs?|glass|cups?|pages?|steps|km)\b/.test(l.slice(m.index + m[0].length, m.index + m[0].length + 12))) {
      let payee = l
        .replace(m[0], ' ')
        .replace(/\b(i|just|spent|paid|bought|cost|ordered|rs\.?|inr|rupees|on|for|at|to|from|today|me|my|a|an|the)\b|₹/g, ' ')
        .replace(/\s+/g, ' ').trim()
      const category = (CATEGORY_WORDS.find(([, re]) => re.test(l)) || ['Other'])[0]
      payee = payee ? cap(payee).slice(0, 30) : category === 'Other' ? 'Expense' : category
      return { type: 'spend', amount, payee, category }
    }
  }
  // "swiggy 450" / "chai 40"
  if ((m = l.match(new RegExp(`^([a-z][a-z' ]{1,24}?)\\s+(?:₹|rs\\.?\\s*)?${num}$`))) && CATEGORY_WORDS.some(([, re]) => re.test(m[1]))) {
    return { type: 'spend', amount: toNum(m[2]), payee: cap(m[1].trim()), category: CATEGORY_WORDS.find(([, re]) => re.test(m[1]))[0] }
  }

  // music practice
  if (/\b(practi[sc]ed?|practi[sc]ing|played|jammed|rehearsed)\b|\bguitar\b/.test(l)) {
    const mins = l.match(new RegExp(`${num}\\s*(min|mins|minutes|m\\b)`)) || null
    const hrs = l.match(new RegExp(`${num}\\s*(hour|hours|hr|hrs|h\\b)`)) || null
    const minutes = mins ? toNum(mins[1]) : hrs ? Math.round(toNum(hrs[1]) * 60) : 0
    if (minutes) {
      const topic = /chord/.test(l) ? 'Chords' : /scale/.test(l) ? 'Scales' : /fingerstyle|finger style/.test(l) ? 'Fingerstyle' : /strum/.test(l) ? 'Strumming' : /song/.test(l) ? 'Song' : 'Free play'
      return { type: 'practice', minutes, topic }
    }
  }

  // slips before sleep ("slept late")
  if (/scroll|doom|reels/.test(l) && /night|late|bed|midnight|\d\s?am\b/.test(l)) return { type: 'slip', id: 'scroll' }
  if (/(junk|pizza|burger|fries|fast food|ordered in|binge)/.test(l) && /(ate|had|ordered|got|junk|binge)/.test(l) && !/₹|\bspent\b/.test(l)) return { type: 'slip', id: 'junk' }
  if (/(slept|went to bed|stayed up|sleeping)\s*(late|past|after)|stayed up|past (12|midnight)|\b(1|2|3)\s?am\b/.test(l)) return { type: 'slip', id: 'late' }

  // sleep
  if (/\b(slept|sleep)\b/.test(l)) {
    const hm = l.match(/(\d+)\s*h(?:ours?|rs?)?\s*(\d+)\s*m/)
    if (hm) return { type: 'sleep', hours: Number(hm[1]) + Number(hm[2]) / 60 }
    if ((m = l.match(new RegExp(`(?:slept|sleep)\\D{0,18}${num}\\s*(?:h|hr|hrs|hours?)?`)))) return { type: 'sleep', hours: toNum(m[1]) }
  }

  // water
  if ((m = l.match(new RegExp(`${num}\\s*(?:glass(?:es)?|cups?)(?:\\s*of)?\\s*(?:water)?`))) && /water|drank|glass|cup/.test(l)) return { type: 'water', cups: Math.round(toNum(m[1])) }
  if (/(drank|had|finished)\s.*(3\s?l|3 litres|3 liters|enough water|water)/.test(l) || /\bhydrat/.test(l)) return { type: 'habit', id: 'water' }

  // habits
  if (/meditat/.test(l)) return { type: 'habit', id: 'med' }
  if (/\b(read|reading|finished (?:my )?(?:pages|chapter))\b|\bpages\b/.test(l)) return { type: 'habit', id: 'read' }
  if (/no.?phone|phone.?free/.test(l)) return { type: 'habit', id: 'phone' }
  if (/8,?000 steps|10k steps|\bsteps\b|\bwalked\b|\bwalk\b/.test(l)) return { type: 'habit', id: 'steps' }

  // workout
  if (/(went to (?:the )?gym|worked out|workout|leg day|push day|pull day|lifted|\bran\b|\brun\b|yoga|swim|cycl)/.test(l)) {
    const name = /leg day/.test(l) ? 'Leg Day' : /push day/.test(l) ? 'Push Day' : /pull day/.test(l) ? 'Pull Day' : /yoga/.test(l) ? 'Yoga' : /\bran\b|\brun\b/.test(l) ? 'Run' : /swim/.test(l) ? 'Swim' : /cycl/.test(l) ? 'Ride' : 'Gym session'
    return { type: 'workout', name }
  }

  // people
  if (/(called|call|talked|spoke|texted|messaged|met|caught up|visited|video.?called|phoned)/.test(l)) {
    const id = Object.keys(PEOPLE_WORDS).find((k) => PEOPLE_WORDS[k].test(l))
    if (id) return { type: 'people', id }
  }

  // mood
  if ((m = l.match(/(?:feel(?:ing)?|felt|mood(?: is| was)?|i'?m|i am)\s+(?:\w+\s+)?(\w+)/))) {
    const hit = MOOD_WORDS.find(([, re]) => re.test(m[1]))
    if (hit) return { type: 'mood', mood: hit[0] }
  }
  return null
}

/** Split into clauses and map each. Returns { actions, unmatched } — unmatched ones are candidates for the AI parser. */
export function localParse(text) {
  // split on commas (but not inside 1,240), semicolons, newlines and connectors
  const clauses = text.split(/(?<!\d),|,(?!\d)|[;\n]+|\s+(?:and then|then|and|also|plus)\s+|\.\s+/i).map((c) => c.trim()).filter(Boolean)
  const actions = []
  const unmatched = []
  for (const c of clauses) {
    const a = parseClause(c)
    if (a) { actions.push(a); continue }
    const last = actions[actions.length - 1]
    const l = c.toLowerCase()
    // modifier: "mostly chords" refines a practice action
    if (last?.type === 'practice' && /^(mostly|mainly|focus(?:ed)? on|worked on|including|some)\b/.test(l)) {
      last.topic = /chord/.test(l) ? 'Chords' : /scale/.test(l) ? 'Scales' : /fingerstyle|finger style/.test(l) ? 'Fingerstyle' : /strum/.test(l) ? 'Strumming' : /song/.test(l) ? 'Song' : last.topic
      continue
    }
    // "called Priya and Dev": a bare name after a people action is another check-in
    const pid = Object.keys(PEOPLE_WORDS).find((k) => PEOPLE_WORDS[k].test(l))
    if (last?.type === 'people' && pid && l.split(/\s+/).length <= 2) { actions.push({ type: 'people', id: pid }); continue }
    unmatched.push(c)
  }
  return { actions: sanitizeActions(actions), unmatched }
}

/**
 * Full pipeline: instant parser first; if some words were not understood, ask the AI (when reachable).
 * Always resolves — never throws.
 */
export async function understand(text) {
  const local = localParse(text)
  if (local.actions.length && !local.unmatched.length) return { actions: local.actions, source: 'instant', unmatched: [], ai: 'skipped' }
  const fallback = { actions: local.actions, source: local.actions.length ? 'instant' : 'none', unmatched: local.unmatched }
  try {
    const ctl = new AbortController()
    const t = setTimeout(() => ctl.abort(), 13000)
    const res = await fetch('/api/ai/parse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }), signal: ctl.signal })
    clearTimeout(t)
    const data = await res.json().catch(() => ({}))
    if (res.ok && Array.isArray(data.actions) && data.actions.length) {
      return { actions: sanitizeActions(data.actions), source: 'ai', reply: data.reply, unmatched: [], ai: 'ok' }
    }
    // ai: ok = the AI answered but found nothing loggable | limited = quota/rate limit | down = AI service failed or timed out | no_key
    if (res.ok) return { ...fallback, ai: 'empty', note: data.reply }
    if (res.status === 429) return { ...fallback, ai: 'limited', note: data.message }
    if (res.status === 503 && data.error === 'no_key') return { ...fallback, ai: 'no_key' }
    return { ...fallback, ai: 'down' }
  } catch {
    return { ...fallback, ai: 'offline', offline: true }
  }
}

export const EXAMPLES = [
  'spent 450 on swiggy, slept 6.5 hours, called mom',
  'meditated, drank 3 glasses of water and read 20 pages',
  'practised guitar for 25 min, mostly chords',
  'feeling great. journal: shipped the demo today',
  'tomorrow priority is finish the deck',
]

export { MOODS }
