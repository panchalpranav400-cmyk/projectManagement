/**
 * Lightweight, zero-dependency canvas confetti particle system.
 * Creates celebratory bursts when completing tasks or hitting project milestones.
 */

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  rotation: number
  vRot: number
  shape: 'rect' | 'circle'
}

export function triggerConfetti(originX?: number, originY?: number) {
  if (typeof window === 'undefined') return

  const canvas = document.createElement('canvas')
  canvas.style.position = 'fixed'
  canvas.style.inset = '0'
  canvas.style.width = '100vw'
  canvas.style.height = '100vh'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex = '99999'
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    canvas.remove()
    return
  }

  const width = (canvas.width = window.innerWidth * window.devicePixelRatio)
  const height = (canvas.height = window.innerHeight * window.devicePixelRatio)
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

  const startX = originX ?? window.innerWidth / 2
  const startY = originY ?? window.innerHeight * 0.4

  const colors = [
    '#38bdf8', // sky
    '#818cf8', // indigo
    '#c084fc', // purple
    '#f472b6', // pink
    '#34d399', // emerald
    '#fbbf24', // amber
    '#60a5fa', // blue
  ]

  const particleCount = 80
  const particles: Particle[] = []

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 4 + Math.random() * 9
    particles.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 3,
      vy: Math.sin(angle) * speed - 3.5, // slight upward bias
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 12,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
    })
  }

  let animationFrameId: number
  const gravity = 0.22
  const drag = 0.98

  function render() {
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)

    let aliveCount = 0

    for (const p of particles) {
      p.vy += gravity
      p.vx *= drag
      p.vy *= drag
      p.x += p.vx
      p.y += p.vy
      p.rotation += p.vRot
      p.alpha -= 0.012

      if (p.alpha > 0) {
        aliveCount++
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
    }

    if (aliveCount > 0) {
      animationFrameId = requestAnimationFrame(render)
    } else {
      cancelAnimationFrame(animationFrameId)
      canvas.remove()
    }
  }

  animationFrameId = requestAnimationFrame(render)
}
