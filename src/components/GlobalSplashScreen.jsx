import { useEffect, useState } from 'react'

function GlobalSplashScreen({ isReady, onComplete }) {
  const [progress, setProgress] = useState(0)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    // Fill from 0 to 100 in ~700ms
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(100, prev + 14))
    }, 100)

    // Start fading out at 700ms
    const fadeTimeout = setTimeout(() => {
      setIsFadingOut(true)
    }, 700)

    // Remove splash at 1000ms (700ms fill + 300ms fade)
    const completeTimeout = setTimeout(() => {
      if (onComplete) onComplete()
    }, 1000)

    return () => {
      clearInterval(interval)
      clearTimeout(fadeTimeout)
      clearTimeout(completeTimeout)
    }
  }, [onComplete])

  return (
    <div className={`splash-screen ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <img src="/thinkora%20image.webp" alt="Thinkora" className="splash-logo" />
        
        <div className="splash-progress-container">
          <div 
            className="splash-progress-bar" 
            style={{ width: `${Math.round(progress)}%` }} 
          />
        </div>
        
        <div className="splash-progress-text">
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  )
}

export default GlobalSplashScreen
