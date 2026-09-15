import { useEffect, useState } from 'react'
import { getHealthStatus } from '../services/api'
import GlobalSplashScreen from '../components/GlobalSplashScreen'

export function SplashProvider({ children }) {
  const [isBackendReady, setIsBackendReady] = useState(false)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    let mounted = true
    const startTime = Date.now()

    const checkHealth = async () => {
      try {
        await getHealthStatus()
        
        // Ensure at least 1 second has passed to show the loading animation
        const elapsed = Date.now() - startTime
        const delay = Math.max(0, 1000 - elapsed)
        
        setTimeout(() => {
          if (mounted) {
            setIsBackendReady(true)
          }
        }, delay)
      } catch (error) {
        if (mounted) {
          // Retry after a delay if backend isn't ready
          setTimeout(checkHealth, 2000)
        }
      }
    }

    checkHealth()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <>
      {children}
      {showSplash && (
        <GlobalSplashScreen 
          isReady={isBackendReady} 
          onComplete={() => setShowSplash(false)} 
        />
      )}
    </>
  )
}
