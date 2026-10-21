import { Routes, Route, Navigate } from 'react-router-dom'
import Shell from './components/Shell.jsx'
import Landing from './pages/Landing.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Today from './pages/Today.jsx'
import Goals from './pages/Goals.jsx'
import Calendar from './pages/Calendar.jsx'
import People from './pages/People.jsx'
import Habits from './pages/Habits.jsx'
import Finance from './pages/Finance.jsx'
import Gym from './pages/Gym.jsx'
import Insights from './pages/Insights.jsx'
import Review from './pages/Review.jsx'
import Journal from './pages/Journal.jsx'
import Settings from './pages/Settings.jsx'
import About from './pages/About.jsx'
import Music from './pages/Music.jsx'
import Recap from './pages/Recap.jsx'
import { useApp } from './store.jsx'
import { IS_DEMO } from './config.js'

export default function App() {
  const { s } = useApp()
  return (
    <>
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <linearGradient id="eg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--a1)" />
          <stop offset="55%" stopColor="var(--a1-bright)" />
          <stop offset="100%" stopColor="var(--a2)" />
        </linearGradient>
      </defs>
    </svg>
    <Routes>
      <Route path="/" element={IS_DEMO ? <Landing /> : <Navigate to={s.onboarded ? '/today' : '/onboarding'} replace />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route element={<Shell />}>
        <Route path="/today" element={<Today />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/people" element={<People />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/gym" element={<Gym />} />
        <Route path="/music" element={<Music />} />
        <Route path="/recap" element={<Recap />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/review" element={<Review />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/settings" element={<Settings />} />
        {IS_DEMO && <Route path="/about" element={<About />} />}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
