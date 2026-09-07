import { useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { Boxes } from './BackgroundBoxes'

/** Mounted in App.tsx behind everything, providing interactive 3D background boxes and ambient lighting */
export function AmbientBackground() {
  const { themeConfig } = useTheme()

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      document.documentElement.style.setProperty('--mouse-screen-x', `${e.clientX}px`)
      document.documentElement.style.setProperty('--mouse-screen-y', `${e.clientY}px`)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Ambient gradient blobs with smooth color transitions (behind boxes) */}
      <div
        className="ambient-blob ambient-blob-a h-[40rem] w-[40rem] pointer-events-none"
        style={{
          top: '-12%',
          left: '-10%',
          backgroundColor: themeConfig.primary,
          opacity: 0.15,
        }}
      />
      <div
        className="ambient-blob ambient-blob-b h-[34rem] w-[34rem] pointer-events-none"
        style={{
          bottom: '-14%',
          right: '-8%',
          backgroundColor: themeConfig.secondary,
          opacity: 0.14,
        }}
      />

      {/* Interactive Aceternity Background Boxes with pointer-events-auto */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto [mask-image:radial-gradient(ellipse_at_center,white_60%,transparent_98%)]">
        <Boxes />
      </div>

      {/* Subtle overlay texture */}
      <div className="grain-overlay pointer-events-none" />
    </div>
  )
}
