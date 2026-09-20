import { useEffect, useRef } from 'react'

// A canvas firework burst, shown behind the login leaderboard popup.
// Everything lives in one canvas so it never touches the page layout.
const COLORS = ['#FFD700', '#FF4D6D', '#4ADE80', '#60A5FA', '#C084FC', '#FB923C', '#22D3EE']
const GRAVITY = 0.03
const DRAG = 0.986
const SPARKS_PER_BURST = 54
const FRAMES_BETWEEN_BURSTS = 20
const MAX_SPARKS = 1200

function makeBurst(width, height) {
  // Bursts appear across the upper two thirds, around the popup.
  const x = width * (0.1 + Math.random() * 0.8)
  const y = height * (0.08 + Math.random() * 0.5)
  const color = COLORS[Math.floor(Math.random() * COLORS.length)]
  const power = 2.2 + Math.random() * 2.4
  const sparks = []
  for (let i = 0; i < SPARKS_PER_BURST; i += 1) {
    const angle = (Math.PI * 2 * i) / SPARKS_PER_BURST + Math.random() * 0.25
    // Vary the speed per spark so the ring looks like a real burst, not a circle.
    const speed = power * (0.45 + Math.random() * 0.75)
    sparks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.976 + Math.random() * 0.014,
      size: 1.8 + Math.random() * 1.6,
      color,
    })
  }
  return sparks
}

function Fireworks() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return undefined
    }
    // Someone who asked their system for less motion gets a still, empty canvas.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    const context = canvas.getContext('2d')
    let width = 0
    let height = 0
    let sparks = []
    let frame = 0
    let animationId = 0

    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      // Fall back to the viewport if the element has not been laid out yet.
      width = canvas.clientWidth || window.innerWidth
      height = canvas.clientHeight || window.innerHeight
      canvas.width = Math.max(1, Math.round(width * ratio))
      canvas.height = Math.max(1, Math.round(height * ratio))
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // Open with three bursts at once so the celebration starts instantly.
    sparks = [...makeBurst(width, height), ...makeBurst(width, height), ...makeBurst(width, height)]

    const draw = () => {
      // A translucent wipe instead of a clear leaves glowing trails behind each spark.
      context.globalCompositeOperation = 'destination-out'
      context.fillStyle = 'rgba(0, 0, 0, 0.18)'
      context.fillRect(0, 0, width, height)
      context.globalCompositeOperation = 'lighter'

      frame += 1
      if (frame % FRAMES_BETWEEN_BURSTS === 0 && sparks.length < MAX_SPARKS) {
        sparks = sparks.concat(makeBurst(width, height))
      }

      sparks = sparks.filter((spark) => spark.life > 0.02)
      for (const spark of sparks) {
        spark.vx *= DRAG
        spark.vy = spark.vy * DRAG + GRAVITY
        spark.x += spark.vx
        spark.y += spark.vy
        spark.life *= spark.decay

        context.globalAlpha = Math.max(spark.life, 0)
        context.fillStyle = spark.color
        context.beginPath()
        context.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2)
        context.fill()
      }
      context.globalAlpha = 1
      animationId = requestAnimationFrame(draw)
    }
    animationId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fireworks-canvas" aria-hidden="true" />
}

export default Fireworks
