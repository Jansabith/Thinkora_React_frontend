import { Medal, Trophy } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link } from 'react-router'
import Avatar from '../components/Avatar'
import FilterTabs from '../components/FilterTabs'
import LeaderboardList from '../components/LeaderboardList'
import LoadError from '../components/LoadError'
import Loading from '../components/Loading'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import { useApiData } from '../hooks/useApiData'
import { useAuth } from '../hooks/useAuth'
import { getCourses } from '../services/courseService'
import { getLeaderboard } from '../services/dashboardService'
import { pluralize } from '../utils/format'

const PERIODS = [
  { value: 'week', label: 'This week' },
  { value: 'last_week', label: 'Last week' },
  { value: 'month', label: 'This month' },
  { value: 'all', label: 'All time' },
]

// The top 3 on steps: 2nd on the left, 1st in the middle, 3rd on the right.
function Podium({ leaders }) {
  const places = [leaders[1], leaders[0], leaders[2]].filter(Boolean)
  return (
    <div className="podium" aria-label="Top 3 students">
      {places.map((row) => (
        <div key={row.student_id} className={`podium-place podium-rank-${Math.min(row.rank, 3)} ${row.is_me ? 'is-me' : ''}`}>
          <span className="podium-medal" aria-hidden="true">
            {row.rank === 1 ? <Trophy size={20} /> : <Medal size={20} />}
          </span>
          <Avatar name={row.name} size={row.rank === 1 ? 64 : 52} />
          <strong>
            {row.name} {row.is_me && <span className="badge badge-new">You</span>}
          </strong>
          <span className="podium-score">{pluralize(row.done_count, 'question')}</span>
          <span className="podium-stand">
            <span className="sr-only">Rank </span>
            {row.rank}
          </span>
        </div>
      ))}
    </div>
  )
}

function YourRankCard({ me, rankedCount }) {
  let message = 'You are at the top. Keep it up!'
  if (me.rank === null) {
    message = 'Mark a question as done to join the leaderboard.'
  } else if (me.to_next_rank !== null) {
    message = `${pluralize(me.to_next_rank, 'more question')} to move up.`
  }

  return (
    <div className="card your-rank">
      <span className="your-rank-number">{me.rank ? `#${me.rank}` : '—'}</span>
      <div>
        <strong>Your rank</strong>
        {me.rank && (
          <p className="muted">
            {pluralize(me.done_count, 'question')} done · {pluralize(rankedCount, 'student')} on the board
          </p>
        )}
        <p>{message}</p>
      </div>
      <Link to="/student/practice" className="btn btn-primary btn-small push-right">
        Practise now
      </Link>
    </div>
  )
}

// Students ranked by practice questions marked as done. Used by students and admins.
function LeaderboardPage() {
  const { user } = useAuth()
  const [period, setPeriod] = useState('week')
  const [courseId, setCourseId] = useState('')

  const { data: courses } = useApiData(getCourses)
  const loadBoard = useCallback(() => getLeaderboard({ period, course: courseId, limit: 50 }), [period, courseId])
  const { data, error, isLoading, reload } = useApiData(loadBoard, { keepPreviousData: true })

  return (
    <>
      <PageHeader title="Leaderboard" subtitle="Students ranked by practice questions marked as done." />

      <div className="toolbar">
        <FilterTabs options={PERIODS} value={period} onChange={setPeriod} label="Time period" />
        <select className="compact-select" aria-label="Course" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
          <option value="">All courses</option>
          {(courses ?? []).map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {isLoading && !data && <Loading message="Loading leaderboard..." />}
      {error && <LoadError error={error} onRetry={reload} />}

      {data && (
        <div className={isLoading ? 'chart-refreshing' : undefined}>
          {user.role === 'student' && data.me && <YourRankCard me={data.me} rankedCount={data.ranked_count} />}

          {data.leaders.length === 0 ? (
            <p className="empty-state">No questions have been marked as done in this period yet. Be the first!</p>
          ) : (
            <>
              <Podium leaders={data.leaders.slice(0, 3)} />
              {data.leaders.length > 3 && (
                <Panel title="Everyone else">
                  <LeaderboardList leaders={data.leaders.slice(3)} />
                </Panel>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}

export default LeaderboardPage
