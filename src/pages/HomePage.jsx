import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { getHealthStatus } from '../services/api'
import { getDashboardPath } from '../utils/auth'

const SERVER_STATUS_LABELS = {
  loading: 'Checking server...',
  ok: 'Server online',
  error: 'Server offline',
}

function HomePage() {
  const { user } = useAuth()
  const [serverStatus, setServerStatus] = useState('loading')
  const [videoEnded, setVideoEnded] = useState(false)
  const [videoSrc, setVideoSrc] = useState('/pc water remove video.mp4')
  const videoRef = useRef(null)

  useEffect(() => {
    getHealthStatus()
      .then(() => setServerStatus('ok'))
      .catch(() => setServerStatus('error'))
  }, [])

  useEffect(() => {
    // Check if it's a mobile screen on mount
    const checkMobile = () => {
      if (window.innerWidth <= 768) {
        setVideoSrc('/mobile water mark remover.mp4')
      } else {
        setVideoSrc('/pc water remove video.mp4')
      }
    }
    checkMobile()
    
    // Optional: Update on resize if needed
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Start playback immediately and ensure it plays fast
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.playbackRate = 1.0
      // Need to load the new source if it changed
      video.load()
      video.play().catch(() => {})
    }
  }, [videoSrc])

  return (
    <div className="landing-fullscreen">
      {/* Video Background */}
      <div className={`landing-video-wrap ${videoEnded ? 'video-ended' : ''}`}>
        <video
          ref={videoRef}
          className="landing-video"
          src={videoSrc}
          muted
          playsInline
          preload="auto"
          onEnded={() => setVideoEnded(true)}
        />
        {/* Dark overlay that fades in after video ends */}
        <div className={`landing-overlay ${videoEnded ? 'show' : ''}`} />
      </div>

      {/* Content that fades in after video */}
      <div className={`landing-content ${videoEnded ? 'show' : ''}`}>
        <h1 className="landing-title">
          Where <span className="text-gradient">Thinking</span> Begins
        </h1>
        <p className="landing-subtitle">
          Explore. Practice. Improve. Your learning journey starts here.
        </p>

        <div className="landing-buttons">
          {user ? (
            <Link to={getDashboardPath(user)} className="btn btn-primary btn-large landing-btn">
              Go to my dashboard <ArrowRight size={18} aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary btn-large landing-btn">
                Student Login <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/get-access" className="btn landing-btn landing-btn-glass">
                Get Access
              </Link>
            </>
          )}
        </div>

        {!user && (
          <p className="landing-note">
            Teacher? <Link to="/admin/login">Admin login</Link>
          </p>
        )}

        <p className={`server-status server-status-${serverStatus}`}>{SERVER_STATUS_LABELS[serverStatus]}</p>
      </div>
    </div>
  )
}

export default HomePage
