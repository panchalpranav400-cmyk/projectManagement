import { useEffect, useRef, useState } from 'react'

const BAR_COUNT = 54

/**
 * Interactive visual energy waveform:
 * Scrubs smoothly with horizontal mouse movement and pulses with subtle rhythmic audio-like harmonics.
 */
export function ScrubWaveform() {
  const [scrub, setScrub] = useState(0.5)
  const [isHovered, setIsHovered] = useState(false)
  const prevX = useRef<number | null>(null)
  const scrubRef = useRef(0.5)
  const [tick, setTick] = useState(0)

  // Gentle rhythmic breathing oscillation
  useEffect(() => {
    let animId: number
    let t = 0
    function loop() {
      t += 0.03
      setTick(t)
      animId = requestAnimationFrame(loop)
    }
    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    function handleMouseMove(e: MouseEvent) {
      if (prevX.current === null) {
        prevX.current = e.clientX
        return
      }
      const delta = e.clientX - prevX.current
      prevX.current = e.clientX
      const next = Math.min(1, Math.max(0, scrubRef.current + (delta / window.innerWidth) * 0.9))
      scrubRef.current = next
      setScrub(next)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
    const norm = i / BAR_COUNT
    const phase = norm * Math.PI * 4 + scrub * Math.PI * 5 + tick
    // Center bell curve envelope
    const envelope = Math.sin(norm * Math.PI)
    const wave = Math.sin(phase) * 16 + Math.cos(phase * 1.5) * 8
    const height = (14 + wave) * (0.4 + envelope * 0.8) * (isHovered ? 1.3 : 1)
    return Math.max(4, height)
  })

  return (
    <div
      aria-hidden="true"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="pointer-events-auto absolute inset-x-0 bottom-0 flex h-28 items-end justify-center gap-[3px] opacity-60 hover:opacity-100 transition-opacity duration-300 sm:h-36 cursor-ew-resize"
    >
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full transition-all duration-75"
          style={{
            height: `${h}px`,
            background: `linear-gradient(to top, var(--color-brand), var(--color-brand-2))`,
            boxShadow: h > 20 ? '0 0 8px var(--color-brand-glow)' : 'none',
          }}
        />
      ))}
    </div>
  )
}
