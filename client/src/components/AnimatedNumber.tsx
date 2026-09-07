import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  duration?: number
}

export function AnimatedNumber({ value, duration = 0.8 }: Props) {
  const [display, setDisplay] = useState(0)
  const fromRef = useRef(0)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setDisplay(value)
      fromRef.current = value
      return
    }

    const from = fromRef.current
    const to = value
    const start = performance.now()
    const durationMs = duration * 1000
    let frame: number

    function tick(now: number) {
      const elapsed = now - start
      const t = Math.min(1, elapsed / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(from + (to - from) * eased))
      if (t < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return <span>{display}</span>
}
