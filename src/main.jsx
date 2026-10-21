import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './store.jsx'
import App from './App.jsx'
import './styles.css'
import { registerServiceWorker } from './pwa.js'
import { initAnalytics, track } from './track.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

registerServiceWorker()
initAnalytics()
track('visit')
