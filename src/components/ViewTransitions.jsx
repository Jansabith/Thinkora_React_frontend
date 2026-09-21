import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useLocation } from 'react-router'

// Cross-fades between pages using the browser's View Transitions API.
//
// It works by holding on to the OLD page for one frame: the browser photographs
// it, React swaps in the new page inside startViewTransition, and the browser
// animates between the two pictures.
//
// Browsers without the API (and visitors who asked for less motion) simply get
// an instant swap, which is exactly today's behaviour.
function ViewTransitions({ children }) {
  const location = useLocation()
  const [shownLocation, setShownLocation] = useState(location)
  const transitionRef = useRef(null)

  useEffect(() => {
    // Only animate when the PAGE changes. Changing a filter (?status=done)
    // stays on the same page and should not fade.
    if (location.pathname === shownLocation.pathname) {
      setShownLocation(location)
      return
    }

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || !document.startViewTransition) {
      setShownLocation(location)
      return
    }

    // If the visitor clicks again mid-fade, skip the old animation.
    transitionRef.current?.skipTransition?.()
    transitionRef.current = document.startViewTransition(() => {
      // flushSync makes React paint the new page INSIDE the transition,
      // which is what the API needs to capture the "after" picture.
      flushSync(() => setShownLocation(location))
    })
  }, [location, shownLocation.pathname])

  return children(shownLocation)
}

export default ViewTransitions
