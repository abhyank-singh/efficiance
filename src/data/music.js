// Music module data. Instruments are data-driven: to add one later, set `ready: true`
// and register a panel for it in src/pages/Music.jsx (PANELS).

export const instruments = [
  { id: 'guitar', name: 'Guitar', icon: '🎸', ready: true },
  { id: 'piano', name: 'Piano', icon: '🎹', ready: false, blurb: 'Scales, chord shapes and a keyboard-based practice plan.' },
  { id: 'vocals', name: 'Vocals', icon: '🎤', ready: false, blurb: 'Warm-ups, range tracking and pitch drills.' },
  { id: 'drums', name: 'Drums', icon: '🥁', ready: false, blurb: 'Rudiments, grooves and tempo ladders.' },
]

export const DAILY_GOAL_MIN = 30

// Today's practice routine (each block logs its minutes when ticked).
export const guitarPlan = [
  { id: 'warm', icon: '🔥', title: 'Warm-up: spider walk', min: 5, tip: 'One finger per fret, slow and even. Relax your thumb.' },
  { id: 'chords', icon: '🎵', title: 'Chord changes', min: 10, tip: 'Use the drill below. Aim for clean changes, not speed.' },
  { id: 'scale', icon: '📈', title: 'A minor pentatonic, 2 positions', min: 10, tip: 'Up and down with a metronome at 70 BPM.' },
  { id: 'song', icon: '🎶', title: 'Song work', min: 15, tip: 'Pick the hardest 8 bars and loop them slowly.' },
]

// Demo baseline: minutes practised on each of the last 7 days (today is added live).
export const practiceSeed = [20, 35, 0, 25, 40, 15]

export const songs = [
  { id: 's1', title: 'Knockin’ on Heaven’s Door', level: 'Beginner', base: 70, next: 'Play the full chorus at tempo' },
  { id: 's2', title: 'Wonderwall (capo 2)', level: 'Beginner', base: 45, next: 'Smooth the Em7 → G change' },
  { id: 's3', title: 'Blackbird (fingerstyle)', level: 'Intermediate', base: 20, next: 'Learn bars 1–8 hands-together' },
]

// Chord shapes. frets: low E → high e; -1 = muted, 0 = open. fingers optional (1-4).
export const chords = [
  { name: 'E', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  { name: 'A', frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
  { name: 'D', frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
  { name: 'G', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
  { name: 'C', frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  { name: 'Em', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  { name: 'Am', frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
  { name: 'Dm', frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  { name: 'E7', frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
  { name: 'A7', frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0] },
  { name: 'F', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: 1 },
  { name: 'B7', frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },
]

// Open-string reference pitches (Hz), low → high.
export const tuning = [
  { s: 'E', oct: 2, hz: 82.41 }, { s: 'A', oct: 2, hz: 110.0 }, { s: 'D', oct: 3, hz: 146.83 },
  { s: 'G', oct: 3, hz: 196.0 }, { s: 'B', oct: 3, hz: 246.94 }, { s: 'e', oct: 4, hz: 329.63 },
]
