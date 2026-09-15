import { Bookmark, BookmarkCheck, Layers } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { updateMyProgress } from '../services/progressService'
import Alert from './Alert'
import StatusBadge from './StatusBadge'

const NO_PROGRESS = {
  is_done: false,
  is_bookmarked: false,
  doubt_status: 'none',
  doubt_message: '',
  admin_reply: '',
  answer_shared: false,
  answer: null,
}

// One practice question for a student: mark it as Done, bookmark it, or ask a Doubt.
// The answer is hidden. It only appears when the teacher chooses to show it to this student.
//
// progress:          this student's saved state for the question
// onProgressChange:  tells the page about the new state after saving
// showLocation:      show "Course › Topic" (for lists with questions from many topics)
function PracticeQuestionCard({ question, number, progress = NO_PROGRESS, onProgressChange, showLocation = false, children }) {
  const [isDoubtFormOpen, setIsDoubtFormOpen] = useState(false)
  const [doubtMessage, setDoubtMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const state = { ...NO_PROGRESS, ...progress }
  const hasDoubt = state.doubt_status !== 'none'

  // Sends the change to Django. Returns true if it was saved.
  async function saveProgress(changes) {
    setError('')
    setIsSaving(true)
    try {
      const updatedProgress = await updateMyProgress(question.id, changes)
      onProgressChange(updatedProgress)
      return true
    } catch (saveError) {
      setError(saveError.message)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDoubtSubmit(event) {
    event.preventDefault()
    const isSaved = await saveProgress({ doubt_status: 'open', doubt_message: doubtMessage.trim() })
    if (isSaved) {
      setIsDoubtFormOpen(false)
      setDoubtMessage('')
    }
  }

  return (
    <div className={`card question-card ${state.is_done ? 'question-done' : ''}`}>
      <div className="question-header">
        {number && <span className="question-label">Question {number}</span>}
        <StatusBadge status={question.difficulty} />
        {hasDoubt && <StatusBadge status={state.doubt_status} />}
        {showLocation && (
          <Link to={`/student/topics/${question.topic}/questions`} className="question-location">
            <Layers size={14} aria-hidden="true" /> {question.course_title} › {question.topic_title}
          </Link>
        )}

        <div className="question-actions">
          <button
            type="button"
            className="icon-button icon-button-small bookmark-button"
            aria-pressed={state.is_bookmarked}
            aria-label={state.is_bookmarked ? 'Remove bookmark' : 'Bookmark this question'}
            title={state.is_bookmarked ? 'Remove bookmark' : 'Bookmark'}
            disabled={isSaving}
            onClick={() => saveProgress({ is_bookmarked: !state.is_bookmarked })}
          >
            {state.is_bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
          <button
            type="button"
            className={`btn btn-small ${state.is_done ? 'btn-success' : 'btn-secondary'}`}
            aria-pressed={state.is_done}
            disabled={isSaving}
            onClick={() => saveProgress({ is_done: !state.is_done })}
          >
            {state.is_done ? '✓ Done' : 'Mark as done'}
          </button>
          {!hasDoubt && (
            <button
              type="button"
              className="btn btn-secondary btn-small"
              aria-expanded={isDoubtFormOpen}
              disabled={isSaving}
              onClick={() => setIsDoubtFormOpen((isOpen) => !isOpen)}
            >
              ? Doubt
            </button>
          )}
        </div>
      </div>

      <p className="question-text">{question.text}</p>

      {children}

      <Alert type="error">{error}</Alert>

      {isDoubtFormOpen && (
        <form className="doubt-panel" onSubmit={handleDoubtSubmit}>
          <label htmlFor={`doubt-${question.id}`}>What is your doubt? (optional)</label>
          <textarea
            id={`doubt-${question.id}`}
            rows={3}
            maxLength={2000}
            value={doubtMessage}
            onChange={(event) => setDoubtMessage(event.target.value)}
            placeholder="For example: I don't know how to start this question."
          />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-small" disabled={isSaving}>
              {isSaving ? 'Sending...' : 'Send doubt'}
            </button>
            <button type="button" className="btn btn-secondary btn-small" onClick={() => setIsDoubtFormOpen(false)} disabled={isSaving}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {state.doubt_status === 'open' && (
        <div className="doubt-panel doubt-open">
          <strong>Doubt sent. Your teacher will reply here.</strong>
          {state.doubt_message && <p className="doubt-message">“{state.doubt_message}”</p>}
          <button type="button" className="btn btn-secondary btn-small" onClick={() => saveProgress({ doubt_status: 'none' })} disabled={isSaving}>
            Withdraw doubt
          </button>
        </div>
      )}

      {state.doubt_status === 'resolved' && (
        <div className="doubt-panel doubt-resolved">
          {state.doubt_message && <p className="doubt-message">You asked: “{state.doubt_message}”</p>}
          <strong>Teacher&apos;s reply:</strong>
          <p className="doubt-reply">{state.admin_reply}</p>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={() => setIsDoubtFormOpen(true)}
              disabled={isSaving || isDoubtFormOpen}
            >
              I still have a doubt
            </button>
            <button type="button" className="btn btn-secondary btn-small" onClick={() => saveProgress({ doubt_status: 'none' })} disabled={isSaving}>
              Clear
            </button>
          </div>
        </div>
      )}

      {state.answer_shared && state.answer && (
        <div className="shared-answer">
          <strong>Answer shared by your teacher</strong>
          <pre className="answer-box">{state.answer}</pre>
        </div>
      )}
    </div>
  )
}

export default PracticeQuestionCard
