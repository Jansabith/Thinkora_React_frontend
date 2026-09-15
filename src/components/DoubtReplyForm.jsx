import { MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { getErrorText } from '../services/api'
import { resolveDoubt } from '../services/progressService'
import Alert from './Alert'

// Builds the api.whatsapp.com URL with a pre-filled message for the student's doubt reply.
function buildWhatsAppUrl(record, reply) {
  const number = (record.student_whatsapp ?? '').replace(/\D/g, '')
  if (!number) return null

  const message = [
    `Hi ${record.student_name},`,
    '',
    `Regarding your doubt in "${record.course_title}" › "${record.topic_title}":`,
    '',
    'Your question:',
    record.doubt_message || '(No message)',
    '',
    'Reply from your teacher:',
    reply.trim() || '(Write your reply above first)',
  ].join('\n')

  return `https://api.whatsapp.com/send/?phone=${number}&text=${encodeURIComponent(message)}`
}

// Admin: write a reply to a student's doubt, and optionally show them the answer.
// Saving marks the doubt as answered.
function DoubtReplyForm({ record, onSaved, onCancel }) {
  const [reply, setReply] = useState(record.admin_reply)
  const [isAnswerShared, setIsAnswerShared] = useState(record.answer_shared)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const hasAnswer = Boolean(record.question_answer)
  const hasWhatsApp = Boolean(record.student_whatsapp)
  const whatsAppUrl = buildWhatsAppUrl(record, reply)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSaving(true)
    try {
      await resolveDoubt(record.id, reply.trim(), hasAnswer ? isAnswerShared : undefined)
      onSaved()
    } catch (saveError) {
      setError(getErrorText(saveError.data) ?? saveError.message)
      setIsSaving(false)
    }
  }

  return (
    <form className="reply-form" onSubmit={handleSubmit}>
      <label htmlFor={`reply-${record.id}`}>Your reply to {record.student_name}</label>
      <textarea
        id={`reply-${record.id}`}
        rows={3}
        maxLength={2000}
        value={reply}
        onChange={(event) => setReply(event.target.value)}
        required
      />

      {hasAnswer && (
        <label className="checkbox-field">
          <input type="checkbox" checked={isAnswerShared} onChange={(event) => setIsAnswerShared(event.target.checked)} />
          Also show the answer to {record.student_name}
        </label>
      )}

      <Alert type="error">{error}</Alert>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-small" disabled={isSaving}>
          {isSaving ? 'Sending...' : 'Send reply'}
        </button>

        {hasWhatsApp ? (
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-small"
            style={{
              background: '#25D366',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              textDecoration: 'none',
            }}
            title={`Send via WhatsApp to ${record.student_whatsapp}`}
          >
            <MessageCircle size={15} aria-hidden="true" />
            Send via WhatsApp
          </a>
        ) : (
          <button
            type="button"
            className="btn btn-small"
            disabled
            title="No WhatsApp number on file for this student. Ask them to add it in their profile."
            style={{ opacity: 0.45, cursor: 'not-allowed' }}
          >
            <MessageCircle size={15} aria-hidden="true" style={{ marginRight: '5px', verticalAlign: 'middle' }} />
            Send via WhatsApp
          </button>
        )}

        <button type="button" className="btn btn-secondary btn-small" onClick={onCancel} disabled={isSaving}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default DoubtReplyForm
