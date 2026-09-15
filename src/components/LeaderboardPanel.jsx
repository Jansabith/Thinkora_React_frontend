import { useApiData } from '../hooks/useApiData'
import { getLeaderboard } from '../services/dashboardService'
import LeaderboardList from './LeaderboardList'
import Loading from './Loading'
import Panel from './Panel'
import PanelLink from './PanelLink'

function loadWeeklyTopFive() {
  return getLeaderboard({ period: 'week', limit: 5 })
}

// The dashboard's small leaderboard: this week's top 5, and your rank if you are not in it.
function LeaderboardPanel({ fullPageLink = '/student/leaderboard' }) {
  const { data, error } = useApiData(loadWeeklyTopFive)
  const isMeOutsideTop = Boolean(data?.me?.rank) && !data.leaders.some((row) => row.is_me)

  return (
    <Panel title="Leaderboard" subtitle="Most questions done this week" action={<PanelLink to={fullPageLink}>View all</PanelLink>}>
      {!data && !error && <Loading message="Loading leaderboard..." />}
      {error && <p className="muted">The leaderboard could not be loaded.</p>}
      {data && data.leaders.length === 0 && <p className="muted">Nobody has finished a question this week yet. Be the first!</p>}
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
