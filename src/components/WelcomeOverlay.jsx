import { useEffect, useState } from 'react'

function WelcomeOverlay({ name, onComplete }) {
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    // Show for 2 seconds, then trigger fade out
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true)
    }, 2000)

    // Wait for the fade out CSS transition (0.6s) to finish before unmounting
    const endTimer = setTimeout(() => {
      if (onComplete) onComplete()
    }, 2600)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(endTimer)
    }
  }, [onComplete])

  return (
    <div className={`welcome-screen ${isFadingOut ? 'fade-out' : ''}`}>
      <h1 className="welcome-text">Hi, {name}!</h1>
    </div>
  )
}

export default WelcomeOverlay
