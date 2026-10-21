// Single source of truth for what the in-app assistant ("Quick Add") may do.
// Imported by BOTH the server (to validate model output before it is sent anywhere)
// and the browser (to validate again before touching app state). Never trust model output.

export const HABIT_IDS = ['med', 'read', 'water', 'steps', 'phone']
export const BREAK_IDS = ['scroll', 'junk', 'late']
export const PEOPLE = {
  mom: 'Mom', dad: 'Dad', riya: 'Riya', arjun: 'Arjun', priya: 'Priya', dev: 'Dev', rajat: 'Rajat sir', meera: 'Meera',
}
export const CATEGORIES = ['Food', 'Transport', 'Groceries', 'Entertainment', 'Shopping', 'Health', 'Other']
export const MOODS = ['😄', '🙂', '😐', '😕', '😞']
export const ACTION_TYPES = ['spend', 'habit', 'slip', 'sleep', 'water', 'journal', 'mood', 'people', 'practice', 'workout', 'priority']

const str = (v, n) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n)
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : NaN }

/** Returns a clean action, or null if it is invalid or out of range. */
export function sanitizeAction(a) {
  if (!a || typeof a !== 'object') return null
  switch (a.type) {
    case 'spend': {
      const amount = Math.round(num(a.amount))
      if (!(amount > 0 && amount <= 1_000_000)) return null
      const category = CATEGORIES.includes(a.category) ? a.category : 'Other'
      return { type: 'spend', amount, payee: str(a.payee, 30) || 'Expense', category }
    }
    case 'habit':
      return HABIT_IDS.includes(a.id) ? { type: 'habit', id: a.id } : null
    case 'slip':
      return BREAK_IDS.includes(a.id) ? { type: 'slip', id: a.id } : null
    case 'sleep': {
      const hours = num(a.hours)
      return hours > 0 && hours <= 16 ? { type: 'sleep', hours: Math.round(hours * 10) / 10 } : null
    }
    case 'water': {
      const cups = Math.round(num(a.cups))
      return cups >= 1 && cups <= 8 ? { type: 'water', cups } : null
    }
    case 'journal': {
      const text = str(a.text, 280)
      return text ? { type: 'journal', text, mood: MOODS.includes(a.mood) ? a.mood : undefined } : null
    }
    case 'mood':
      return MOODS.includes(a.mood) ? { type: 'mood', mood: a.mood } : null
    case 'people':
      return typeof a.id === 'string' && Object.hasOwn(PEOPLE, a.id) ? { type: 'people', id: a.id } : null
    case 'practice': {
      const minutes = Math.round(num(a.minutes))
      return minutes >= 1 && minutes <= 600 ? { type: 'practice', minutes, topic: str(a.topic, 30) || 'Free play' } : null
    }
    case 'workout': {
      const name = str(a.name, 40)
      return name ? { type: 'workout', name } : null
    }
    case 'priority': {
      const text = str(a.text, 120)
      return text ? { type: 'priority', text } : null
    }
    default:
      return null
  }
}

export const sanitizeActions = (list) =>
  (Array.isArray(list) ? list : []).slice(0, 12).map(sanitizeAction).filter(Boolean)
