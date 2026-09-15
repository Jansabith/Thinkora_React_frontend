import { useEffect, useRef, useState } from 'react'

// Measures an element's width and updates it when the element resizes (charts use this).
// Usage: const [ref, width] = useElementWidth();  <div ref={ref}>...</div>
export function useElementWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const element = ref.current
    if (!element) {
      return undefined
    }
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, width]
}
