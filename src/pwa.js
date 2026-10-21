import { useEffect, useState } from 'react'
import { track } from './track.js'

// Installable web app: service worker registration + the install prompt.
let deferred = null
const listeners = new Set()
const notify = () => listeners.forEach((f) => f())

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; notify() })
  window.addEventListener('appinstalled', () => { deferred = null; track('pwa_installed'); notify() })
}

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* offline support is a bonus */ })
  })
}

const isStandalone = () =>
  typeof window !== 'undefined' && (window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true)
const isIOS = () => typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)

export function usePwaInstall() {
  const [, force] = useState(0)
  useEffect(() => {
    const f = () => force((n) => n + 1)
    listeners.add(f)
    return () => listeners.delete(f)
  }, [])
  return {
    installed: isStandalone(),
    canPrompt: Boolean(deferred),         // Chrome/Edge/Android: one-tap install
    ios: isIOS() && !isStandalone(),      // iOS Safari: manual Share → Add to Home Screen
    async install() {
      if (!deferred) return false
      deferred.prompt()
      const { outcome } = await deferred.userChoice
      track('pwa_prompt_' + outcome)
      deferred = null
      notify()
      return outcome === 'accepted'
    },
  }
}
