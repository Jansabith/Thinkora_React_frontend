import { Trophy, X } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { Link } from 'react-router'
import { useApiData } from '../hooks/useApiData'
import { useAuth } from '../hooks/useAuth'
import { getLeaderboard } from '../services/dashboardService'
import Fireworks from './Fireworks'
import LeaderboardList from './LeaderboardList'
import Loading from './Loading'

function loadLastWeekTopFive() {
  return getLeaderboard({ period: 'last_week', limit: 5 })
}

// Shown once, right after logging in: LAST week's finished leaderboard with a firework
// burst, so the winners of the week that just ended get celebrated.
// Students see their own rank; admins see the same board and can click a student.
function LeaderboardPopup({ onClose }) {
  const { user } = useAuth()
  const { data, error } = useApiData(loadLastWeekTopFive)
  const isStudent = user?.role === 'student'
  const fullPageLink = isStudent ? '/student/leaderboard' : '/admin/leaderboard'

  // Esc closes the popup, like every other dialog.
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    },
    [onClose],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const me = data?.me
  const hasLeaders = Boolean(data && data.leaders.length > 0)

  return (
    <div className="lb-popup-backdrop" onClick={onClose} role="presentation">
      <Fireworks />
      <div
        className="lb-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lb-popup-title"
        // Clicks inside must not reach the backdrop, which closes the popup.
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="lb-popup-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="lb-popup-crown" aria-hidden="true">
          <Trophy size={30} strokeWidth={2.5} />
        </div>

        <h2 className="lb-popup-title" id="lb-popup-title">
          {isStudent ? 'Last Week’s Leaderboard' : 'Last Week’s Top Students'}
        </h2>
        <p className="lb-popup-subtitle">Most questions done last week</p>

        {!data && !error && <Loading message="Loading leaderboard..." />}
        {error && <p className="muted">The leaderboard could not be loaded.</p>}
        {data && !hasLeaders && (
          <p className="muted lb-popup-empty">
            {isStudent
              ? 'Nobody finished a question last week. This week is yours to win!'
              : 'No student finished a question last week.'}
          </p>
        )}
        {hasLeaders && <LeaderboardList leaders={data.leaders} compact />}

        {isStudent && me && (
          <p className="lb-popup-me">
            {me.rank
              ? `You were #${me.rank} last week with ${me.done_count} ${me.done_count === 1 ? 'question' : 'questions'}.`
              : 'You were not on last week’s board. Make this week count!'}
          </p>
        )}

        <div className="lb-popup-actions">
          <Link to={fullPageLink} className="btn btn-primary" onClick={onClose}>
            View full leaderboard
          </Link>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default LeaderboardPopup
