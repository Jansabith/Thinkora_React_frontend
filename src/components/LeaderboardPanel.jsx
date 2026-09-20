import { useApiData } from '../hooks/useApiData'
import { useAuth } from '../hooks/useAuth'
import { getLeaderboard } from '../services/dashboardService'
import LeaderboardList from './LeaderboardList'
import Loading from './Loading'
import Panel from './Panel'
import PanelLink from './PanelLink'

function loadWeeklyTopFive() {
  return getLeaderboard({ period: 'week', limit: 5 })
}

// The dashboard's small leaderboard: this week's top 5, and your rank if you are not in it.
// Students see it on their own dashboard; admins see the same board on theirs (they are
// never ranked themselves, so Django sends me: null and the "You are #x" line stays hidden).
function LeaderboardPanel({ fullPageLink = '/student/leaderboard' }) {
  const { user } = useAuth()
  const { data, error } = useApiData(loadWeeklyTopFive)
  const isStudent = user?.role === 'student'
  const isMeOutsideTop = Boolean(data?.me?.rank) && !data.leaders.some((row) => row.is_me)
  const emptyText = isStudent
    ? 'Nobody has finished a question this week yet. Be the first!'
    : 'No student has finished a question this week yet.'

  return (
    <Panel title="Leaderboard" subtitle="Most questions done this week" action={<PanelLink to={fullPageLink}>View all</PanelLink>}>
      {!data && !error && <Loading message="Loading leaderboard..." />}
      {error && <p className="muted">The leaderboard could not be loaded.</p>}
      {data && data.leaders.length === 0 && <p className="muted">{emptyText}</p>}
      {data && data.leaders.length > 0 && <LeaderboardList leaders={data.leaders} compact />}
      {isMeOutsideTop && (
        <p className="leaderboard-me-line">
          You are <strong>#{data.me.rank}</strong> with {data.me.done_count} questions this week.
        </p>
      )}
    </Panel>
  )
}

export default LeaderboardPanel
