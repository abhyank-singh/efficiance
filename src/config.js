// One codebase, two builds:
//   demo     → public showcase: sample persona, About page, tour, no personal data, AI is rate-limited
//   personal → your own copy (runs on your Mac): your name, live Google Calendar, no demo banner
// Chosen at build time via VITE_APP_MODE (see package.json scripts / Dockerfile).
export const IS_DEMO = import.meta.env.VITE_APP_MODE === 'demo'

// Wipes the sample-data state this browser has saved, then reloads.
export const resetDemo = () => { try { localStorage.removeItem('efficiance-v1') } catch { /* ignore */ } window.location.assign('/today') }

export const DEFAULT_NAME = IS_DEMO ? 'Alex' : 'there'

// Shown on the About page. Leave a link empty ('') to hide its button.
export const PROFILE = {
  name: 'Abhyank Singh',
  tagline: 'Product & Strategy',
  github: 'https://github.com/abhyank-singh/efficiance',
  linkedin: 'https://www.linkedin.com/in/abhyank-singh/',
  email: 'singhabhyank@gmail.com',
}
