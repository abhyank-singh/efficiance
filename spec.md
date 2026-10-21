# Efficiance — Product Spec

> *"You have just 1 life. Why not track it like your biggest project?"*

Personal + professional life-tracking web app ("Life OS") built as a side project.
**Derived from the Claude Design prototype (`Efficiance.dc.html`), which remains the
source of truth for all visuals.** Where this spec and the prototype disagree on
anything visual, the prototype wins.

---

## 1. Positioning & core idea

Six apps track fragments of your life (calendar, habits, budget, fitness, notes,
contacts). Efficiance connects them into **one intelligence layer over seven
modules** — so your calendar knows you're tired, your budget knows your habits,
and cross-module insights emerge that no single app could produce.

The hero features:
- **Morning Briefing** — one glanceable paragraph synthesizing calendar, sleep,
  budget, people, and workouts.
- **Cross-module Insights** — "You sleep ~40 min less on days with 5+ meetings."
  AI-generated (OpenAI), grounded in the user's actual tracked data.
- **Day Close ritual** — a 60-second nightly seal: one journal line, mood,
  tomorrow's #1 priority.

## 2. Design system (source of truth: `Efficiance.dc.html`)

- **Font:** Plus Jakarta Sans (400–800), Google Fonts.
- **Light theme:** background `#E9EDF3` with aurora radial gradients
  (`#DEEAFF` blue top-right, mint green bottom-left), text `#16181D`,
  secondary `#5B6472`, muted `#98A2B3`.
- **Accent:** blue→emerald gradient `linear-gradient(135deg,#2563EB,#12B981)`
  (also `#3B82F6`/`#10B981` at various opacities for active states).
- **Evening mode:** dark navy variant toggled from Today screen (and auto-labels
  the Day Close section).
- **Cards:** white/translucent, 12–16px radii, soft layered shadows
  (`0 1px 2px rgba(16,24,40,0.05), 0 10px 30px rgba(16,24,40,0.08)`).
- **Animations:** `rise` (screen enter), `pop` (habit check), `flame` (streaks),
  `glowpulse`, `ringin` (progress rings), `confall` (confetti on goal complete).
- **Navigation:** desktop sidebar (Today, Goals, Calendar, People, Habits,
  Finance, Gym & Health ─ divider ─ Insights, Weekly Review, Journal, Settings);
  mobile (<800px) bottom nav (Today, Cal, Habits, ₹, Gym, More) with a "More" sheet.
- **FAB:** global quick-actions button — "Log a spend" opens amount → payee →
  auto-suggested category → Done.
- **Currency:** INR (₹) throughout.

## 3. Screens (14, as in the prototype)

1. **Landing** — hero, problem statement ("your life is scattered across 6 apps"),
   6 feature tiles, "works with" strip, CTA into the app.
2. **Onboarding** — 3 steps: name (with live greeting preview) → pick focus areas
   (Career, Fitness, Money, Relationships, Learning, Mindfulness) → connect
   calendar (Google live; others demo-mode). Skippable.
3. **Today** — Morning Briefing paragraph + 3 quick actions; today's schedule;
   top goals; habit checklist with streaks; week's spend vs budget; next workout
   card (fits your free block); people check-ins due; insight of the day;
   **Day Close** ritual (journal line, mood, tomorrow's priority, "Seal the day ✨").
4. **Goals** — lanes with milestone checklists, % progress, linked modules,
   weekly-target progress bars; full-screen confetti celebration on completion.
5. **Calendar** — Day/Week views; events with tags; occasions from People module
   (birthdays); free-block suggestions ("Leg Day 🏋️ or Read 20 pages 📖?");
   protected-day callout. **Live Google Calendar sync** (see §6).
6. **People** — relationship garden: circles (Family, Friends, Colleagues,
   Mentors) with per-person warmth that fades by days-since-contact (no guilt
   badges); check-in logging; upcoming occasions with gift ideas.
7. **Habits** — two tabs. *Build:* daily checklist, streaks with flame, category
   tags. *Break:* downward frequency trends (not fragile abstinence streaks),
   slip logging with notes, pattern hints ("slips cluster after 11 PM").
   "Rough day" grace mechanic.
8. **Finance** — tabs: Spend (today's transactions, quick-log), Budgets (category
   caps with over/under states), Subscriptions (renewal dates), SIPs (funds,
   monthly amounts, totals, goal links) + investment wishlist.
9. **Gym & Health** — tabs: Train (guided workout player: exercise, target
   sets×reps@kg, weight/reps steppers, "Log set ✓", rest timer, PB tracking with
   celebration), Library (exercises by body part with PBs), sleep chart (7-day).
10. **Insights** — AI-generated cross-module insight cards: module chips,
    finding, "Why we think this" evidence line, suggested action. See §5.
11. **Weekly Review** — auto-generated "Life Sprint Review": wins, stat tiles,
    focus suggestion for next week, "Plan next week → pre-fill calendar blocks."
    Screenshot-worthy on purpose.
12. **Journal** — mood chart (14 days) + entries fed from Day Close.
13. **Settings** — integrations (connect/disconnect states), focus areas
    reconfiguration, theme, notification times, **Export my data (JSON)**.

## 4. Data model & persistence

Client-side state persisted to **localStorage** (side-project scope; export via
Settings → JSON). Seeded with the prototype's demo data (habits, people,
budgets, SIPs, exercise library with PBs, sleep, journal, transactions) so the
app is instantly demo-able. Key entities:

`user` (name, focusAreas), `habits[]` (build/break, streaks, slips),
`people[]` (circle, cadence, lastContact), `occasions[]`, `goals[]`
(milestones, linked modules), `transactions[]`, `budgets[]`, `subscriptions[]`,
`sips[]`, `workouts[]` (exercises, sets, PBs), `sleep[]`, `journal[]`
(date, mood, text), `events[]` (local + Google-synced), `insights[]` (cached).

## 5. AI-powered Insights (OpenAI)

- **Model:** `gpt-5-mini`. **Budget:** moderate ($1–5), sensible caching.
- **Key handling:** `OPENAI_API_KEY` in a git-ignored `.env`, loaded only by the
  backend. Never shipped to the browser or baked into the Docker image
  (injected at `docker run -e` time).
- **Endpoint:** `POST /api/insights` — backend assembles a compact summary of
  tracked data (habit streaks/slips, spend vs budget, workout completion, sleep,
  people contact gaps, journal moods, calendar density), prompts the model to
  return **strict JSON** matching the card schema
  `{mods: string[], text, why, action}`, validates, and returns it.
- **Demo-safety strategy (chosen): pre-gen + live bonus.**
  - During development, OpenAI generates a polished insight set that ships as a
    bundled cache — the demo path is guaranteed even fully offline.
  - A **"Regenerate with AI ✨"** button on the Insights screen makes a live call
    as the wow moment; on error/timeout (~8s) it gracefully keeps the cached set
    with a subtle notice.
  - Morning Briefing paragraph uses the same mechanism (cached, live-refreshable).

## 6. Integrations

| Integration | Status |
|---|---|
| **Google Calendar** | **LIVE** — OAuth (user's own Google Cloud project, testing mode), read events into Calendar/Today. Seeded demo events remain as instant fallback if auth fails — demo never blocks on OAuth. |
| Google Fit / health | UI-mock — manual workout/sleep logging (Fit REST API is deprecated). |
| Bank statement import | UI-mock — "coming soon" state in Settings. |
| UPI apps | UI-mock — quick-log FAB mimics UPI speed; no payment integration. |
| Outlook, Apple Health, Google Contacts | UI-mock connect states as in prototype. |

## 7. Demo path & build order

Build proceeds in this numbered order — **pause after each step for local
preview approval before continuing.** The order is the demo narrative: each
step ends with something showable.

1. **Scaffold + app shell** — Vite/React frontend + Express backend (single
   repo), design tokens, fonts, aurora background, sidebar/bottom nav, routing
   for all 13 screens (placeholder bodies), FAB shell, **Dockerfile +
   .dockerignore + docker-compose** from day one; `.env` wiring.
2. **Landing + Onboarding** — the demo's opening 30 seconds.
3. **Today** — Morning Briefing (cached AI paragraph), schedule, goal/habit/
   spend/workout/people summary cards, insight-of-the-day, Day Close ritual,
   evening mode toggle.
4. **Habits** — build + break tabs, streaks, slips, rough-day grace.
5. **Finance** — spend quick-log FAB, budgets, subscriptions, SIPs.
6. **Gym & Health** — workout player with set logging, rest timer, PBs,
   library, sleep chart.
7. **People + Goals** — warmth garden, check-ins, occasions; goal lanes with
   confetti completion.
8. **Calendar + Google sync** — day/week views, occasions, free-block
   suggestions; live Google Calendar OAuth with seeded fallback.
9. **Insights (AI) + Journal + Weekly Review** — pre-generated insight cache,
   "Regenerate with AI ✨" live call, journal fed by Day Close, weekly review.
10. **Settings + polish + ship** — integrations panel, JSON export, final
    container build, deploy.

## 8. Architecture

```
┌─ Docker container ──────────────────────────────┐
│  Express (Node 22)                              │
│  ├─ serves built React app (static)             │
│  ├─ POST /api/insights   → OpenAI gpt-5-mini    │
│  ├─ POST /api/briefing   → OpenAI gpt-5-mini    │
│  └─ /api/google/*        → Calendar OAuth+read  │
│      (OPENAI_API_KEY, GOOGLE_* via env)         │
└─────────────────────────────────────────────────┘
   Browser: React SPA, localStorage persistence
```

Dev mode: Vite dev server proxying `/api` → Express. Prod/demo: one container,
`docker run -p 3000:3000 --env-file .env efficiance`.

## 9. Non-goals

Multi-user/auth, server-side database, mobile apps, push notifications,
real bank/UPI/health integrations, light-mode variant beyond the prototype's
evening toggle.
