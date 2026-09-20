import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { getNotifications } from '../services/dashboardService'
import { useAuth } from '../hooks/useAuth'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import WelcomeOverlay from './WelcomeOverlay'
import LeaderboardPopup from './LeaderboardPopup'
import FloatingChat from './FloatingChat'

const REFRESH_EVERY_MS = 60000

// The frame around every logged-in page: sidebar on the left, top bar, and the page itself.
// It also keeps the notification numbers (bell and sidebar badges) up to date.
function AppShell() {
  const { user } = useAuth()
  const location = useLocation()
  const [notifications, setNotifications] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  // True only when the user just signed in on the login page (read once, then cleared).
  const [justLoggedIn] = useState(() => {
    if (sessionStorage.getItem('justLoggedIn')) {
      sessionStorage.removeItem('justLoggedIn')
      return true
    }
    return false
  })
  const [showWelcome, setShowWelcome] = useState(justLoggedIn)
  // Last week's leaderboard shows on EVERY page load and refresh, for students
  // and admins alike. After a fresh login it waits for the "Hi, <name>!" greeting
  // to fade first; otherwise it appears straight away.
  const [showLeaderboard, setShowLeaderboard] = useState(!justLoggedIn)

  const refreshNotifications = useCallback(() => {
    getNotifications()
      .then(setNotifications)
      .catch(() => {
        // Notifications are extra information: the page keeps working without them.
      })
  }, [])

  // Refresh when the page changes, and every minute.
  useEffect(() => {
    refreshNotifications()
  }, [location.pathname, refreshNotifications])

  useEffect(() => {
    const timer = setInterval(refreshNotifications, REFRESH_EVERY_MS)
    return () => clearInterval(timer)
  }, [refreshNotifications])

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])

  return (
    <div className={`app-shell ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar badges={notifications?.badges ?? {}} onNavigate={closeSidebar} />
      <div className="sidebar-backdrop" onClick={closeSidebar} aria-hidden="true" />

      <div className="shell-main">
        <Topbar notifications={notifications} onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="shell-content">
          {/* Pages can call refreshNotifications with the useShell() hook. */}
          <Outlet context={{ refreshNotifications }} />
        </main>
      </div>

      {showWelcome && (
        <WelcomeOverlay
          name={user?.first_name || user?.username || 'there'}
          onComplete={() => {
            setShowWelcome(false)
            setShowLeaderboard(true)
          }}
        />
      )}

      {showLeaderboard && <LeaderboardPopup onClose={() => setShowLeaderboard(false)} />}

      {user && <FloatingChat />}
    </div>
  )
}

export default AppShell
