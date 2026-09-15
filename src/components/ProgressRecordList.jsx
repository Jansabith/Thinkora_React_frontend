import { useState } from 'react'
import { Link } from 'react-router'
import { getErrorText } from '../services/api'
import { shareAnswer } from '../services/progressService'
import { formatDateTime } from '../utils/format'
import Alert from './Alert'
import DoubtReplyForm from './DoubtReplyForm'
import StatusBadge from './StatusBadge'

// Admin: preview the question's answer and show it to (or hide it from) this one student.
function AnswerSharing({ record, onChanged }) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  if (!record.question_answer) {
    return <p className="field-hint">This question has no answer yet, so there is nothing to show the student.</p>
  }

  async function handleToggle() {
    setError('')
    setIsSaving(true)
    try {
      await shareAnswer(record.id, !record.answer_shared)
      onChanged()
    } catch (shareError) {
      setError(getErrorText(shareError.data) ?? shareError.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="answer-sharing">
      <details>
        <summary>Question answer (only you can see this)</summary>
        <pre className="answer-box">{record.question_answer}</pre>
      </details>
      <div className="form-actions">
        <button
          type="button"
          className={`btn btn-small ${record.answer_shared ? 'btn-secondary' : 'btn-success'}`}
          onClick={handleToggle}
          disabled={isSaving}
        >
          {record.answer_shared ? 'Hide answer from student' : 'Show answer to student'}
        </button>
        {record.answer_shared && (
          <span className="field-hint">Shown to {record.student_name} since {formatDateTime(record.answer_shared_at)}</span>
        )}
      </div>
      <Alert type="error">{error}</Alert>
    </div>
  )
}

// Admin: a list of "student X finished / asked about question Y".
// showStudent: show the student's name (not needed on a single student's page)
// onChanged:   called after a change is saved, so the page can reload
function ProgressRecordList({ records, showStudent = false, onChanged, emptyText }) {
  const [replyingToId, setReplyingToId] = useState(null)

  if (records.length === 0) {
    return <p className="empty-state">{emptyText}</p>
  }

  return (
    <div>
      {records.map((record) => {
        const hasDoubt = record.doubt_status !== 'none'

        return (
          <div key={record.id} className="card record-card">
            <div className="record-header">
              {showStudent && (
                <Link to={`/admin/students/${record.student}`} className="record-student">
                  {record.student_name}
                </Link>
              )}
              <span className="record-location">
                {record.course_title} › {record.topic_title}
              </span>
              <StatusBadge status={record.question_difficulty} />
              {record.is_done && <StatusBadge status="done" />}
              {hasDoubt && <StatusBadge status={record.doubt_status} />}
              {record.answer_shared && <StatusBadge status="shared" />}
            </div>

            <p className="question-text">{record.question_text}</p>

            <p className="field-hint">
              {record.is_done && `Done: ${formatDateTime(record.done_at)}`}
              {record.is_done && record.doubt_raised_at && ' · '}
              {record.doubt_raised_at && `Doubt asked: ${formatDateTime(record.doubt_raised_at)}`}
            </p>

            {hasDoubt && (
              <div className={`doubt-panel doubt-${record.doubt_status}`}>
                <strong>Doubt:</strong>
                <p className="doubt-message">{record.doubt_message || '(No message: the student only clicked Doubt.)'}</p>

                {record.doubt_status === 'resolved' && (
                  <>
                    <strong>
                      Reply by {record.resolved_by ?? 'an admin'} · {formatDateTime(record.resolved_at)}
                    </strong>
                    <p className="doubt-reply">{record.admin_reply}</p>
                  </>
                )}

                {replyingToId === record.id ? (
                  <DoubtReplyForm
                    record={record}
                    onSaved={() => {
                      setReplyingToId(null)
                      onChanged()
                    }}
                    onCancel={() => setReplyingToId(null)}
                  />
                ) : (
                  <button type="button" className="btn btn-primary btn-small" onClick={() => setReplyingToId(record.id)}>
                    {record.doubt_status === 'open' ? 'Reply' : 'Edit reply'}
                  </button>
                )}
              </div>
            )}

            {(hasDoubt || record.answer_shared) && <AnswerSharing record={record} onChanged={onChanged} />}
          </div>
        )
      })}
    </div>
  )
}

export default ProgressRecordList
