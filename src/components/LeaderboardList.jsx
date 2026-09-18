import { Trophy } from 'lucide-react'
import Avatar from './Avatar'

// Ranked students: position, avatar, name and questions done. The logged-in student is highlighted.
// compact: a lighter, narrower style for the dashboard panel.
function LeaderboardList({ leaders, compact = false }) {
  return (
    <ol className={`leaderboard ${compact ? 'leaderboard-compact' : ''}`}>
      {leaders.map((row) => (
        <li key={row.student_id} className={`leaderboard-row ${row.is_me ? 'is-me' : ''} ${row.rank === 1 ? 'is-first' : ''}`}>
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
          <Avatar name={row.name} size={compact ? 36 : 42} />
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
        </li>
      ))}
    </ol>
  )
}

export default LeaderboardList
