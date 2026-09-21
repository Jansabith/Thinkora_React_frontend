import { useEffect, useRef, useState } from 'react'

const DURATION_MS = 900

// Slows down near the end, so the number "lands" instead of stopping dead.
function easeOut(progress) {
  return 1 - (1 - progress) ** 3
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

// Counts from the previous value up to `target` over about a second.
// Returns `target` straight away when the visitor asked for less motion.
export function useCountUp(target, duration = DURATION_MS) {
  const isNumber = typeof target === 'number' && Number.isFinite(target)
  const [shown, setShown] = useState(isNumber ? 0 : target)
  const fromRef = useRef(0)

  useEffect(() => {
    if (!isNumber) {
      setShown(target)
      return undefined
    }
    if (prefersReducedMotion() || target === fromRef.current) {
      fromRef.current = target
      setShown(target)
      return undefined
    }

    const from = fromRef.current
    const distance = target - from
    const start = performance.now()
    let frame = 0

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      setShown(Math.round(from + distance * easeOut(progress)))
      if (progress < 1) {
        frame = requestAnimationFrame(step)
      } else {
        fromRef.current = target
      }
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, isNumber])

  return shown
}
