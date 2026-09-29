import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

// Each page loads as its own chunk, so the landing page doesn't ship the chart library.
const Landing = lazy(() => import('./pages/Landing.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
