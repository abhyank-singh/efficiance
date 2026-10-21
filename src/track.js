// Privacy-friendly product metrics. No cookies, no personal data, honors Do-Not-Track.
// - Always keeps simple counters in this browser (visible on the About page).
// - If VITE_GOATCOUNTER is set at build time (a free GoatCounter site code), also sends anonymous events there.
const KEY = 'efficiance-metrics'
const dnt = () => typeof navigator !== 'undefined' && (navigator.doNotTrack === '1' || window.doNotTrack === '1')

export function track(event) {
  try {
    const m = JSON.parse(localStorage.getItem(KEY) || '{}')
    m[event] = (m[event] || 0) + 1
    m._first = m._first || Date.now()
    localStorage.setItem(KEY, JSON.stringify(m))
  } catch { /* storage unavailable */ }
  if (dnt()) return
  try { window.goatcounter?.count?.({ path: 'event/' + event, title: event, event: true }) } catch { /* ignore */ }
}

export function initAnalytics() {
  const code = import.meta.env.VITE_GOATCOUNTER
  if (!code || dnt() || document.querySelector('script[data-goatcounter]')) return
  const s = document.createElement('script')
  s.async = true
  s.src = 'https://gc.zgo.at/count.js'
  s.dataset.goatcounter = `https://${code}.goatcounter.com/count`
  document.head.appendChild(s)
}
