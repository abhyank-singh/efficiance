import { shortDay, monthDay, weekday } from './dates.js'

// Seed/demo data — ported verbatim from the Claude Design prototype (Efficiance.dc.html).
// Keeps the app instantly demo-able; user actions layer on top of this via the store.

export const payees = [
  { name: 'Swiggy', icon: 'food', cat: 'Food' },
  { name: 'Zomato', icon: 'food', cat: 'Food' },
  { name: 'Chai Point', icon: 'coffee', cat: 'Food' },
  { name: 'Auto fare', icon: 'car', cat: 'Transport' },
  { name: 'Kirana Store', icon: 'cart', cat: 'Groceries' },
  { name: 'BigBasket', icon: 'veg', cat: 'Groceries' },
]

export const ghostApps = [
  { name: 'Calendar', icon: 'calendar' },
  { name: 'Habit app', icon: 'habits' },
  { name: 'Budget app', icon: 'cash' },
  { name: 'Fitness app', icon: 'gym' },
  { name: 'Notes', icon: 'notes' },
  { name: 'Contacts', icon: 'users' },
]

export const featureTiles = [
  { icon: 'sun', title: 'Morning Briefing', desc: 'One glanceable paragraph that synthesizes your calendar, sleep, budget, people and workouts, before your first coffee.' },
  { icon: 'brain', title: 'Cross-module Insights', desc: '"You sleep 40 min less on 5-meeting days." Your data starts talking to itself.' },
  { icon: 'sprout', title: 'People warmth', desc: 'Relationships that gently fade when neglected, with no red badges and no guilt. Just gardening.' },
  { icon: 'trend-down', title: 'Break bad habits', desc: 'Downward frequency trends instead of fragile abstinence streaks. One slip never shatters the system.' },
  { icon: 'rupee', title: 'UPI-speed spend log', desc: 'Amount, payee, done. Logging a chai takes as long as paying for it.' },
  { icon: 'trend-up', title: 'SIP discipline', desc: 'Track every SIP, plan the next one, and link investments to life goals.' },
]

export const worksWith = [
  { name: 'Google Calendar', icon: 'calendar' },
  { name: 'Outlook', icon: 'mail' },
  { name: 'Google Fit', icon: 'heart' },
  { name: 'Apple Health', icon: 'apple' },
  { name: 'UPI apps', icon: 'rupee' },
]

export const focusAreas = [
  { name: 'Career', icon: 'briefcase' },
  { name: 'Fitness', icon: 'gym' },
  { name: 'Money', icon: 'rupee' },
  { name: 'Relationships', icon: 'sprout' },
  { name: 'Learning', icon: 'books' },
  { name: 'Mindfulness', icon: 'lotus' },
]

export const habits = [
  { id: 'med', name: 'Meditate 10 min', cat: 'Mindfulness', seed: 3 },
  { id: 'read', name: 'Read 20 pages', cat: 'Learning', seed: 1 },
  { id: 'water', name: 'Drink 3L water', cat: 'Health', seed: 5 },
  { id: 'steps', name: '8,000 steps', cat: 'Health', seed: 2 },
  { id: 'phone', name: 'No-phone breakfast', cat: 'Mindfulness', seed: 4 },
]

export const breakHabits = [
  { id: 'scroll', name: 'Late-night scrolling', from: 10, pattern: 'Most slips happen after 11 PM on weekdays', trend: [10, 9, 7, 6, 5] },
  { id: 'junk', name: 'Junk food orders', from: 7, pattern: 'Slips cluster on days you skip the gym', trend: [7, 6, 5, 4, 4] },
  { id: 'late', name: 'Sleeping past 12:30 AM', from: 6, pattern: 'Sunday nights are your weak spot', trend: [6, 5, 4, 3, 3] },
]

export const people = [
  { g: 'Family', list: [{ id: 'mom', n: 'Mom', d: 2, cad: 'Weekly' }, { id: 'dad', n: 'Dad', d: 9, cad: 'Weekly' }, { id: 'riya', n: 'Riya (sis)', d: 5, cad: 'Weekly' }] },
  { g: 'Friends', list: [{ id: 'arjun', n: 'Arjun', d: 3, cad: 'Weekly' }, { id: 'sneha', n: 'Sneha', d: 18, cad: 'Monthly' }, { id: 'kabir', n: 'Kabir', d: 26, cad: 'Monthly' }] },
  { g: 'Colleagues', list: [{ id: 'priya', n: 'Priya', d: 1, cad: 'Weekly' }, { id: 'dev', n: 'Dev', d: 12, cad: 'Monthly' }] },
  { g: 'Mentors', list: [{ id: 'rajat', n: 'Rajat sir', d: 34, cad: 'Monthly' }, { id: 'meera', n: 'Meera', d: 40, cad: 'Monthly' }] },
]

export const occasions = [
  { id: 'mom', icon: 'cake', name: "Mom’s birthday", date: shortDay(2), inDays: 'in 2 days', gift: 'Gift idea: that Kanjivaram saree she bookmarked' },
  { id: 'arjun', icon: 'cake', name: "Arjun’s birthday", date: shortDay(15), inDays: 'in 15 days', gift: 'Gift idea: mechanical keyboard' },
  { id: 'anniv', icon: 'gem', name: "Parents' anniversary", date: shortDay(24), inDays: 'in 24 days', gift: 'Book a table at their favourite place' },
  { id: 'sneha', icon: 'party', name: "Sneha’s wedding anniversary", date: 'Mon, Sep 14', inDays: 'in 67 days', gift: '' },
]

export const budgets = [
  { cat: 'Food & dining', icon: 'food', spent: 6400, cap: 8000 },
  { cat: 'Transport', icon: 'car', spent: 1450, cap: 3000 },
  { cat: 'Groceries', icon: 'cart', spent: 4100, cap: 6000 },
  { cat: 'Entertainment', icon: 'movie', spent: 2150, cap: 2000 },
  { cat: 'Shopping', icon: 'bag', spent: 1800, cap: 5000 },
  { cat: 'Health', icon: 'pill', spent: 900, cap: 3000 },
]

export const subs = [
  { name: 'Netflix', amt: '₹199', renews: 'Renews ' + monthDay(6) },
  { name: 'Spotify', amt: '₹119', renews: 'Renews ' + monthDay(12) },
  { name: 'Cult.fit', amt: '₹1,249', renews: 'Renews ' + monthDay(23) },
  { name: 'iCloud 200GB', amt: '₹219', renews: 'Renews ' + monthDay(19) },
]

export const sips = [
  { fund: 'Parag Parikh Flexi Cap', amt: '₹10,000', date: '5th of month', total: '₹1,20,000', goal: 'House Down Payment' },
  { fund: 'UTI Nifty 50 Index', amt: '₹5,000', date: '10th of month', total: '₹60,000', goal: '' },
  { fund: 'SBI Gold Fund', amt: '₹2,000', date: '15th of month', total: '₹24,000', goal: '' },
]

export const wishlist = [
  { fund: 'Mirae Asset ELSS', amt: '₹5,000/mo', start: 'Target start: Aug 2026' },
  { fund: 'HDFC Corporate Bond', amt: '₹3,000/mo', start: 'Target start: Sep 2026' },
]

export const library = [
  { part: 'Chest', list: [{ name: 'Barbell Bench Press', pb: 'PB: 70kg × 5', tag: 'Compound' }, { name: 'Incline Dumbbell Press', pb: 'PB: 26kg × 8', tag: 'Compound' }, { name: 'Push-Ups', pb: 'PB: 32 reps', tag: 'Bodyweight' }, { name: 'Cable Fly', pb: 'PB: 18kg × 12', tag: 'Isolation' }, { name: 'Dips', pb: 'PB: +10kg × 8', tag: 'Bodyweight' }] },
  { part: 'Back', list: [{ name: 'Deadlift', pb: 'PB: 110kg × 3', tag: 'Compound' }, { name: 'Pull-Ups', pb: 'PB: 12 reps', tag: 'Bodyweight' }, { name: 'Bent-Over Barbell Row', pb: 'PB: 60kg × 8', tag: 'Compound' }, { name: 'Lat Pulldown', pb: 'PB: 65kg × 10', tag: 'Machine' }, { name: 'Face Pulls', pb: 'PB: 25kg × 15', tag: 'Isolation' }] },
  { part: 'Legs', list: [{ name: 'Barbell Back Squat', pb: 'PB: 80kg × 5', tag: 'Compound' }, { name: 'Leg Press', pb: 'PB: 160kg × 10', tag: 'Machine' }, { name: 'Walking Lunges', pb: 'PB: 16kg × 20', tag: 'Compound' }, { name: 'Leg Curl', pb: 'PB: 45kg × 12', tag: 'Machine' }, { name: 'Standing Calf Raise', pb: 'PB: 60kg × 15', tag: 'Isolation' }] },
  { part: 'Shoulders', list: [{ name: 'Overhead Press', pb: 'PB: 42.5kg × 5', tag: 'Compound' }, { name: 'Lateral Raise', pb: 'PB: 10kg × 12', tag: 'Isolation' }, { name: 'Front Raise', pb: 'PB: 10kg × 10', tag: 'Isolation' }, { name: 'Rear Delt Fly', pb: 'PB: 8kg × 15', tag: 'Isolation' }, { name: 'Barbell Shrugs', pb: 'PB: 70kg × 12', tag: 'Isolation' }] },
  { part: 'Arms', list: [{ name: 'Barbell Curl', pb: 'PB: 30kg × 8', tag: 'Isolation' }, { name: 'Hammer Curl', pb: 'PB: 14kg × 10', tag: 'Isolation' }, { name: 'Concentration Curl', pb: 'PB: 12kg × 10', tag: 'Isolation' }, { name: 'Tricep Pushdown', pb: 'PB: 30kg × 12', tag: 'Isolation' }, { name: 'Skull Crushers', pb: 'PB: 25kg × 10', tag: 'Isolation' }, { name: 'Bench Dips', pb: 'PB: 25 reps', tag: 'Bodyweight' }] },
  { part: 'Core', list: [{ name: 'Plank', pb: 'PB: 3m 10s', tag: 'Bodyweight' }, { name: 'Hanging Leg Raise', pb: 'PB: 15 reps', tag: 'Bodyweight' }, { name: 'Russian Twists', pb: 'PB: 40 reps', tag: 'Bodyweight' }, { name: 'Cable Crunch', pb: 'PB: 35kg × 15', tag: 'Machine' }, { name: 'Ab Wheel Rollout', pb: 'PB: 12 reps', tag: 'Bodyweight' }] },
]

export const legDay = [
  { name: 'Barbell Back Squat', target: '4 × 5 @ 75kg', pb: 80 },
  { name: 'Leg Press', target: '3 × 10 @ 150kg', pb: 160 },
  { name: 'Walking Lunges', target: '3 × 20 @ 14kg', pb: 16 },
  { name: 'Leg Curl', target: '3 × 12 @ 40kg', pb: 45 },
  { name: 'Standing Calf Raise', target: '4 × 15 @ 50kg', pb: 60 },
]

export const sleep = [7.2, 6.8, 6.2, 7.5, 6.1, 8.1, 6.2].map((h, i) => ({ label: weekday(i - 6), h }))

export const insights = [
  { mods: ['Sleep', 'Calendar'], text: 'You sleep ~40 min less on days with 5+ meetings.', why: 'Based on 4 weeks of sleep logs matched against calendar density.', action: 'Block a wind-down at 10:30 PM' },
  { mods: ['Gym', 'Calendar'], text: 'Workout completion is 2× higher when scheduled before 8 AM.', why: '14 of 16 morning sessions completed vs 7 of 16 evening ones.', action: 'Schedule workouts at 7 AM' },
  { mods: ['Finance', 'Gym'], text: 'Food-delivery spend spikes on days you skip the gym.', why: 'Avg ₹410 on skipped days vs ₹140 on workout days.', action: 'Prep dinner on rest days' },
  { mods: ['People'], text: 'No contact with your Mentors circle this month.', why: 'Last log: Rajat sir, 34 days ago.', action: 'Schedule a mentor call' },
  { mods: ['Mood', 'Calendar'], text: 'Your mood dips on Sunday evenings.', why: 'Journal mood averages 2.1/5 on Sundays vs 3.8 weekdays.', action: 'Plan something light for Sundays' },
  { mods: ['Habits'], text: "'No late-night scrolling' slips cluster after 11 PM on weekdays.", why: '9 of 12 slips this month were logged between 11 PM–1 AM.', action: 'Enable wind-down reminder' },
  { mods: ['Finance'], text: 'Subscriptions grew ₹450/month this quarter.', why: '2 new subscriptions added since April.', action: 'Review subscriptions' },
  { mods: ['Learning', 'Calendar'], text: 'You learn most consistently in Tuesday free blocks.', why: '6 of last 8 learning sessions happened Tuesday 6–8 PM.', action: 'Protect Tuesday evenings' },
]

export const journal = [
  { date: shortDay(-1), mood: '🙂', text: 'Design review went long but the free block saved the day, so I got the gym session in.' },
  { date: shortDay(-2), mood: '😄', text: 'Finished Part II of Deep Work. Evenings really are my learning slot.' },
  { date: shortDay(-3), mood: '😐', text: 'Slept badly, skipped meditation. Ordered in again. Noticing the pattern.' },
  { date: shortDay(-4), mood: '😕', text: 'Low-energy day. Called Arjun though, which helped.' },
  { date: shortDay(-5), mood: '😄', text: 'Long ride in the morning, kirana run, movie night. A properly balanced day.' },
  { date: shortDay(-6), mood: '🙂', text: 'Shipped the sprint demo. Team seemed happy. PB on bench!' },
]

export const txDays = [
  { label: 'Yesterday, ' + shortDay(-1), items: [{ p: 'Zomato', i: 'food', c: 'Food', a: 450 }, { p: 'Kirana Store', i: 'cart', c: 'Groceries', a: 610 }, { p: 'Auto fare', i: 'car', c: 'Transport', a: 90 }] },
  { label: shortDay(-2), items: [{ p: 'BigBasket', i: 'veg', c: 'Groceries', a: 1240 }, { p: 'Netflix', i: 'movie', c: 'Entertainment', a: 199 }, { p: 'Chai Point', i: 'coffee', c: 'Food', a: 60 }] },
  { label: shortDay(-3), items: [{ p: 'Swiggy', i: 'food', c: 'Food', a: 380 }, { p: 'Metro card', i: 'metro', c: 'Transport', a: 500 }] },
]
