import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastViewport } from './components/Toast'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppShell } from './components/AppShell'
import { AmbientBackground } from './components/AmbientBackground'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Dashboard } from './pages/Dashboard'
import { Designs } from './pages/Designs'
import { ProjectDetail } from './pages/ProjectDetail'

const queryClient = new QueryClient()

function NoiseFilter() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <filter id="app-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
        <feComposite in2="SourceGraphic" operator="in" result="noise" />
        <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
      </filter>
    </svg>
  )
}

/** The routed page content transitions; AppShell (sidebar/header) around it does not. */
function AnimatedOutlet() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}

function AuthedLayout() {
  return (
    <ProtectedRoute>
      <AppShell>
        <AnimatedOutlet />
      </AppShell>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <ThemeProvider>
            <BrowserRouter>
              <div className="relative min-h-screen overflow-x-hidden bg-[#09090b] text-white">
                <NoiseFilter />
                <AmbientBackground />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route element={<AuthedLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/designs" element={<Designs />} />
                    <Route path="/projects/:id" element={<ProjectDetail />} />
                  </Route>
                </Routes>
                <ToastViewport />
              </div>
            </BrowserRouter>
          </ThemeProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
