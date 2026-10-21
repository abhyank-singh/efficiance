import { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_NAME } from './config.js'

// Central app state, persisted to localStorage. Screens read/write through useApp().
// Grows module-by-module as build steps land; seed data lives in src/data/seed.js.

const KEY = 'efficiance-v1'

const initial = {
  name: DEFAULT_NAME,
  onboarded: false,
  focus: ['Career', 'Fitness', 'Money'],
  connected: { google: false, outlook: false },
  evening: false,
  sealed: false,
  journalLine: '',
  mood: '',
  priority: '',
  habitState: {
    med: { done: false, streak: 12 },
    read: { done: true, streak: 34 },
    water: { done: true, streak: 8 },
    steps: { done: false, streak: 21 },
    phone: { done: false, streak: 5 },
  },
  slips: { scroll: 4, junk: 3, late: 2 },
  slipSaved: {},
  roughDay: false,
  blockTaken: false,
  qaOpen: false, // quick-spend modal (transient; reset on load)
  workoutOn: false,
  journalEntries: null, // null → screens fall back to seed journal
  txToday: [
    { p: 'Chai Point', i: '☕', c: 'Food', a: 40 },
    { p: 'Auto fare', i: '🛺', c: 'Transport', a: 120 },
  ],
  peopleLogged: {},
  celebrated: {},
  milestones: {},
  waterCups: 5,
  windDown: true,
  integrations: {
    'Google Calendar': true,
    'Outlook': false,
    'Google Contacts': true,
    'Google Fit': true,
    'Apple Health': false,
    'Bank statement import': false,
  },
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initial
    return { ...initial, ...JSON.parse(raw), qaOpen: false }
  } catch {
    return initial
  }
}

const AppCtx = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  const patch = (p) => setState((s) => ({ ...s, ...(typeof p === 'function' ? p(s) : p) }))

  return <AppCtx.Provider value={{ s: state, patch }}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

export function useMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 800)
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 800)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return mobile
}

export const fmtINR = (n) => '₹' + n.toLocaleString('en-IN')
