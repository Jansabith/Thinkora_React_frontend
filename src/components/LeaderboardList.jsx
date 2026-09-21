import { Trophy } from 'lucide-react'
import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import Avatar from './Avatar'

// Ranked students: position, avatar, name and questions done. The logged-in student is highlighted.
// compact: a lighter, narrower style for the dashboard panel.
//
// Admins and the Main Admin can click a row to open that student's full page
// (their progress, the questions they finished and their doubts). Students cannot:
// the /admin/students/<id> page and its API both require student-management rights.
function LeaderboardList({ leaders, compact = false }) {
  const { user } = useAuth()
  const canOpenStudent = Boolean(user?.can_manage_students)

  return (
    <ol className={`leaderboard ${compact ? 'leaderboard-compact' : ''}`}>
      {leaders.map((row) => {
        const rowClass = `leaderboard-row ${row.is_me ? 'is-me' : ''} ${row.rank === 1 ? 'is-first' : ''}`
        const content = (
          <>
            <span className={`leaderboard-rank rank-${Math.min(row.rank, 4)}`}>
              <span className="sr-only">Rank </span>
              {row.rank <= 3 ? (
                <>
                  {row.rank} <Trophy size={16} strokeWidth={2.5} />
                </>
              ) : (
                row.rank
              )}
            </span>
            <Avatar name={row.name} size={compact ? 36 : 42} color={row.avatar_color} icon={row.avatar_icon} />
            <span className="leaderboard-name">
              <span className={`leaderboard-name-text ${row.rank === 1 ? 'rank-1-name' : ''}`} title={row.name}>
                {row.name}
              </span>
              {row.is_me && <span className="leaderboard-you-badge">You</span>}
            </span>
            <span className="leaderboard-score">
              <strong>{row.done_count}</strong>
              <span className="leaderboard-score-word"> {row.done_count === 1 ? 'question' : 'questions'}</span>
            </span>
          </>
        )

        return (
          <li key={row.student_id}>
            {canOpenStudent ? (
              <Link to={`/admin/students/${row.student_id}`} className={rowClass} title={`See everything ${row.name} has done`}>
                {content}
              </Link>
            ) : (
              <div className={rowClass}>{content}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default LeaderboardList
