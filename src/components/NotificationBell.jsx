import { Bell, MessageCircleQuestion, MessageSquareText, UserPlus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { useClickOutside } from '../hooks/useClickOutside'
import { timeAgo } from '../utils/format'

const KIND_STYLES = {
  reply: { icon: MessageSquareText, tone: 'tone-blue' },
  request: { icon: UserPlus, tone: 'tone-amber' },
  doubt: { icon: MessageCircleQuestion, tone: 'tone-violet' },
}

// The bell in the top bar. notifications comes from GET /api/notifications/ (loaded by AppShell).
function NotificationBell({ notifications }) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const close = useCallback(() => setIsOpen(false), [])
  const ref = useClickOutside(isOpen, close)

  const count = notifications?.count ?? 0
  const items = notifications?.items ?? []

  return (
    <div className="dropdown" ref={ref}>
      <button
        type="button"
        className="icon-button"
        aria-label={count ? `Notifications, ${count} new` : 'Notifications'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Bell size={18} />
        {count > 0 && <span className="notification-dot">{count > 99 ? '99+' : count}</span>}
      </button>

      {isOpen && (
        <div className="dropdown-panel">
          <div className="dropdown-title">
            Notifications
            {count > 0 && <span className="badge badge-new">{count} new</span>}
          </div>
          {items.length === 0 && <p className="search-empty">You are all caught up.</p>}
          {items.map((item) => {
            const style = KIND_STYLES[item.kind] ?? KIND_STYLES.reply
            const Icon = style.icon
            return (
              <button
                key={item.id}
                type="button"
                className="dropdown-item"
                onClick={() => {
                  close()
                  navigate(item.link)
                }}
              >
                <span className={`notification-item-icon ${style.tone}`} aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span className="notification-item-text">
                  <strong>{item.title}</strong>
                  <span>
                    {item.message} {item.time && `· ${timeAgo(item.time)}`}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
