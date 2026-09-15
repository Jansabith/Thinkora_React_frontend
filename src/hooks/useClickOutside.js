import { useEffect, useRef } from 'react'

// Calls onOutside when the user clicks outside the element, or presses Escape (for dropdowns).
// Usage: const ref = useClickOutside(isOpen, () => setIsOpen(false))
export function useClickOutside(isActive, onOutside) {
  const ref = useRef(null)

  useEffect(() => {
    if (!isActive) {
      return undefined
    }

    function handlePointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onOutside()
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onOutside()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActive, onOutside])

  return ref
}
