import { Layers, MessageSquareText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import FilterTabs from '../../components/FilterTabs'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import { useApiData } from '../../hooks/useApiData'
import { useShell } from '../../hooks/useShell'
import { getMyMessages, markMessagesSeen } from '../../services/progressService'
import { formatDateTime, timeAgo } from '../../utils/format'

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Waiting for reply' },
  { value: 'resolved', label: 'Answered' },
]

// The student's doubts and the teachers' replies. New replies are marked as read after they are shown.
function MessagesPage() {
  const { refreshNotifications } = useShell()
  const { data: messages, error, isLoading, reload } = useApiData(getMyMessages)
  const [filter, setFilter] = useState('')

  // Once the messages are on screen, tell Django the replies were seen, and update the badges.
  // (The "New" labels stay visible until the next visit.)
  useEffect(() => {
    if (!messages?.some((message) => !message.reply_seen)) {
      return
    }
    markMessagesSeen()
      .then(refreshNotifications)
      .catch(() => {
        // Not critical: the replies simply stay "new" until the next visit.
      })
  }, [messages, refreshNotifications])

  if (isLoading) {
    return <Loading message="Loading messages..." variant="list" count={5} />
  }
  if (error) {
    return <LoadError error={error} onRetry={reload} />
  }

  const shown = messages.filter((message) => !filter || message.doubt_status === filter)

  return (
    <>
      <PageHeader title="Messages" subtitle="Your doubts and your teachers' replies." />

      <FilterTabs options={FILTERS} value={filter} onChange={setFilter} label="Filter messages" />

      {shown.length === 0 && (
        <p className="empty-state">
          {messages.length === 0 ? 'No messages yet. Use the Doubt button on a question to ask your teacher.' : 'Nothing here.'}
        </p>
      )}

      {shown.map((message) => (
        <article key={message.id} className={`card message-card ${message.reply_seen ? '' : 'is-unread'}`}>
          <div className="question-header">
            <Link to={`/student/topics/${message.topic_id}/questions`} className="question-location">
              <Layers size={14} aria-hidden="true" /> {message.course_title} › {message.topic_title}
            </Link>
            <StatusBadge status={message.question_difficulty} />
            <StatusBadge status={message.doubt_status} />
            {!message.reply_seen && <StatusBadge status="new" />}
          </div>

          <p className="question-text">{message.question_text}</p>

          <p className="doubt-message">
            You asked{message.doubt_raised_at && ` ${timeAgo(message.doubt_raised_at)}`}: “{message.doubt_message || 'I have a doubt about this question.'}”
          </p>

          {message.doubt_status === 'resolved' ? (
            <div className="message-reply">
              <div className="message-reply-header">
                <MessageSquareText size={16} aria-hidden="true" />
                {message.resolved_by_name ?? 'Your teacher'} replied · {formatDateTime(message.resolved_at)}
              </div>
              <p className="doubt-reply">{message.admin_reply}</p>
              {message.answer_shared && message.answer && (
                <>
                  <strong>Answer shared by your teacher</strong>
                  <pre className="answer-box">{message.answer}</pre>
                </>
              )}
            </div>
          ) : (
            <p className="field-hint">Waiting for your teacher to reply.</p>
          )}
        </article>
      ))}
    </>
  )
}

export default MessagesPage
