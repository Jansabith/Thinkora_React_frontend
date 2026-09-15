import { Trophy } from 'lucide-react'
import Avatar from './Avatar'

// Ranked students: position, avatar, name and questions done. The logged-in student is highlighted.
// compact: a lighter, narrower style for the dashboard panel.
function LeaderboardList({ leaders, compact = false }) {
  return (
    <ol className={`leaderboard ${compact ? 'leaderboard-compact' : ''}`}>
      {leaders.map((row) => (
        <li key={row.student_id} className={`leaderboard-row ${row.is_me ? 'is-me' : ''}`}>
          <span className={`leaderboard-rank rank-${Math.min(row.rank, 4)}`}>
            <span className="sr-only">Rank </span>
            {row.rank <= 3 ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {row.rank} <Trophy size={14} strokeWidth={2.5} />
              </span>
            ) : (
              row.rank
            )}
          </span>
          <Avatar name={row.name} size={compact ? 32 : 38} />
          <span className="leaderboard-name">
            <span className="leaderboard-name-text" title={row.name}>
              {row.name}
            </span>
            {row.is_me && <span className="badge badge-new">You</span>}
          </span>
          <span className="leaderboard-score">
            <strong>{row.done_count}</strong>
            <span className="leaderboard-score-word"> {row.done_count === 1 ? 'question' : 'questions'}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}

export default LeaderboardList
