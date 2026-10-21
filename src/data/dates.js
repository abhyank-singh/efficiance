// The demo data tells a story anchored on "today". These helpers turn day offsets
// (0 = today, -1 = yesterday, +2 = in two days) into labels so the sample data never looks stale.
const DAY = 86400000
const at = (off) => new Date(Date.now() + off * DAY)
const f = (off, o) => at(off).toLocaleDateString('en-US', o)

export const shortDay = (off = 0) => f(off, { weekday: 'short', month: 'short', day: 'numeric' }) // Wed, Oct 21
export const longDay = (off = 0) => f(off, { weekday: 'long', month: 'long', day: 'numeric' })    // Wednesday, October 21
export const monthDay = (off = 0) => f(off, { month: 'short', day: 'numeric' })                   // Oct 21
export const weekday = (off = 0) => f(off, { weekday: 'short' })                                  // Wed
export const dayNum = (off = 0) => f(off, { weekday: 'short', day: 'numeric' })                   // Wed 21
