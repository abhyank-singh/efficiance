import { createElement } from 'react'
import { ICONS } from './icons.js'

// Older saved data (and anything typed by a person) may still hold an emoji. Map it to an icon so it renders consistently.
// Written as escapes on purpose: no emoji literals live in the source.
const LEGACY = {
  '\u{2600}': 'sun',
  '\u{1F3AF}': 'goals',
  '\u{1F5D3}': 'calendar',
  '\u{1F331}': 'sprout',
  '\u{2705}': 'habits',
  '\u{20B9}': 'rupee',
  '\u{1F3CB}': 'gym',
  '\u{1F3B8}': 'guitar',
  '\u{1F9E0}': 'brain',
  '\u{1F3C1}': 'flag',
  '\u{1F39E}': 'recap',
  '\u{1F4D3}': 'journal',
  '\u{2699}': 'settings',
  '\u{1F4A1}': 'idea',
  '\u{2728}': 'spark',
  '\u{1F9EA}': 'flask',
  '\u{1F319}': 'moon',
  '\u{1F525}': 'flame',
  '\u{1F382}': 'cake',
  '\u{1F389}': 'party',
  '\u{1F4DE}': 'phone',
  '\u{1F3B5}': 'note',
  '\u{1F3B6}': 'music',
  '\u{1F4C8}': 'trend-up',
  '\u{1F4C9}': 'trend-down',
  '\u{1F634}': 'sleep',
  '\u{1F4A7}': 'water',
  '\u{1F399}': 'mic',
  '\u{26A0}': 'alert',
  '\u{26A1}': 'zap',
  '\u{1F914}': 'help',
  '\u{1F4B8}': 'cash',
  '\u{1F354}': 'food',
  '\u{1F961}': 'food',
  '\u{2615}': 'coffee',
  '\u{1F6FA}': 'car',
  '\u{1F687}': 'metro',
  '\u{1F6D2}': 'cart',
  '\u{1F96C}': 'veg',
  '\u{1F3AC}': 'movie',
  '\u{1F6CD}': 'bag',
  '\u{1F48A}': 'pill',
  '\u{1F9FE}': 'receipt',
  '\u{1F3B9}': 'piano',
  '\u{1F3A4}': 'voice',
  '\u{1F941}': 'drum',
  '\u{1F514}': 'bell',
  '\u{1F500}': 'shuffle',
  '\u{1F3C6}': 'trophy',
  '\u{1F3C5}': 'medal',
  '\u{1F9B5}': 'activity',
  '\u{2764}': 'heart',
  '\u{1F34E}': 'apple',
  '\u{1F4BC}': 'briefcase',
  '\u{1F4DA}': 'books',
  '\u{1F4D6}': 'book',
  '\u{1F9D8}': 'lotus',
  '\u{1F33F}': 'leaf',
  '\u{1F48D}': 'gem',
  '\u{1F381}': 'gift',
  '\u{1F91D}': 'handshake',
  '\u{1F4AC}': 'chat',
  '\u{1F9ED}': 'compass',
  '\u{1F393}': 'grad',
  '\u{23F1}': 'timer',
  '\u{1F56F}': 'candle',
  '\u{2744}': 'snow',
  '\u{1F60C}': 'calm',
  '\u{2B07}': 'download',
  '\u{2B06}': 'upload',
  '\u{1F4E7}': 'mail',
  '\u{1F4DD}': 'notes',
  '\u{1F465}': 'users',
  '\u{1F5A5}': 'monitor',
  '\u{2601}': 'cloud',
  '\u{2713}': 'check',
  '\u{2715}': 'close',
  '\u{25B6}': 'play',
  '\u{25A0}': 'stop',
  '\u{25CF}': 'dot',
}
const resolve = (name) => (ICONS[name] ? name : LEGACY[String(name || '').replace(/\uFE0F/g, '')] || FACE[name])

// One icon set for the whole app (Lucide, line style). Colour follows the text colour (currentColor).
// Decorative by default: pass `title` to make an icon meaningful to screen readers.
export default function Icon({ name, size = 18, stroke = 2, title, style, ...rest }) {
  const parts = ICONS[resolve(name)]
  if (!parts) return null
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden={title ? undefined : 'true'} role={title ? 'img' : undefined} aria-label={title}
      style={{ flex: 'none', verticalAlign: '-0.2em', ...style }} {...rest}
    >
      {parts.map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs }))}
    </svg>
  )
}

// Mood values are stored as emoji (they are the person's data and stay readable in exports),
// but they are drawn as line faces so the UI looks the same on every device.
const FACE = { '\u{1F604}': 'face-5', '\u{1F642}': 'face-4', '\u{1F610}': 'face-3', '\u{1F615}': 'face-2', '\u{1F61E}': 'face-1' }
export function Mood({ value, size = 22, style }) {
  const name = FACE[value]
  return name ? <Icon name={name} size={size} style={style} /> : <span>{value}</span>
}
