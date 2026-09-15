import { BookOpen, MessageSquareText, ShieldCheck, UserCheck } from 'lucide-react'
import { Link } from 'react-router'
import { timeAgo } from '../utils/format'

const KIND_STYLES = {
  student: { icon: UserCheck, tone: 'tone-green' },
  content: { icon: BookOpen, tone: 'tone-blue' },
  doubt: { icon: MessageSquareText, tone: 'tone-violet' },
  admin: { icon: ShieldCheck, tone: 'tone-amber' },
}

// Admin history lines: icon, message, who and when. Lines with a page link can be clicked.
function ActivityFeed({ logs, emptyText = 'No activity yet.' }) {
  if (logs.length === 0) {
    return <p className="muted">{emptyText}</p>
  }

  return (
    <ul className="activity-list">
      {logs.map((log) => {
        const style = KIND_STYLES[log.kind] ?? KIND_STYLES.content
        const Icon = style.icon
        const content = (
          <>
            <span className={`activity-icon ${style.tone}`} aria-hidden="true">
              <Icon size={17} />
            </span>
            <span className="activity-text">
              {log.message}
              <span className="activity-time">
                {log.actor_name && `${log.actor_name} · `}
                {timeAgo(log.created_at)}
              </span>
            </span>
          </>
        )
        return (
          <li key={log.id}>
            {log.link ? (
              <Link to={log.link} className="activity-item">
                {content}
              </Link>
            ) : (
              <div className="activity-item">{content}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default ActivityFeed
