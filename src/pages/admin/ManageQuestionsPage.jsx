import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router'
import Alert from '../../components/Alert'
import DifficultyTabs from '../../components/DifficultyTabs'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import QuestionForm from '../../components/QuestionForm'
import StatusBadge from '../../components/StatusBadge'
import { useApiData } from '../../hooks/useApiData'
import { useAuth } from '../../hooks/useAuth'
import { getTopic } from '../../services/courseService'
import { getProgressRecords } from '../../services/progressService'
import { deleteQuestion, getQuestions } from '../../services/questionService'
import { pluralize } from '../../utils/format'

// How many students finished or asked about one question, and who they are.
function QuestionStudentActivity({ records, isOpen, onToggle }) {
  const doneCount = records.filter((record) => record.is_done).length
  const openDoubtCount = records.filter((record) => record.doubt_status === 'open').length

  return (
    <div className="question-students">
      <div className="question-students-summary">
        <span className="badge badge-done">{doneCount} done</span>
        <span className="badge badge-open">{pluralize(openDoubtCount, 'open doubt')}</span>
        {records.length > 0 && (
          <button type="button" className="btn btn-secondary btn-small" aria-expanded={isOpen} onClick={onToggle}>
            {isOpen ? 'Hide students' : 'Show students'}
          </button>
        )}
      </div>
      {isOpen && (
        <ul className="student-activity-list">
          {records.map((record) => (
            <li key={record.id}>
              <Link to={`/admin/students/${record.student}`}>{record.student_name}</Link>
              {record.is_done && <StatusBadge status="done" />}
              {record.doubt_status !== 'none' && <StatusBadge status={record.doubt_status} />}
              {record.answer_shared && <StatusBadge status="shared" />}
              {record.doubt_message && <span className="cell-sub">“{record.doubt_message}”</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Admin: add, edit and delete the practice questions of one topic, and see student activity.
function ManageQuestionsPage() {
  const { topicId } = useParams()
  const { user } = useAuth()
  const [difficulty, setDifficulty] = useState('')
  // null = no form open; 'new' = adding; a question object = editing that question
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [openActivityId, setOpenActivityId] = useState(null)
  const [message, setMessage] = useState(null)

  const loadTopic = useCallback(() => getTopic(topicId), [topicId])
  const topicResult = useApiData(loadTopic)

  const loadQuestions = useCallback(() => getQuestions(topicId, difficulty), [topicId, difficulty])
  const questionsResult = useApiData(loadQuestions)

  // Student activity is student data: only admins with student rights may load it.
  const canSeeStudents = user.can_manage_students
  const loadRecords = useCallback(
    () => (canSeeStudents ? getProgressRecords({ topic: topicId }) : Promise.resolve([])),
    [topicId, canSeeStudents],
  )
  const recordsResult = useApiData(loadRecords)

  // After a change, reload the questions AND the topic (its difficulty counts changed).
  function refresh() {
    topicResult.reload()
    questionsResult.reload()
  }

  function handleSaved(savedQuestion, isNew) {
    setEditingQuestion(null)
    setMessage({ type: 'success', text: isNew ? 'Question added.' : 'Question updated.' })
    refresh()
  }

  async function handleDelete(question) {
    if (!window.confirm('Delete this question and all student progress on it? This cannot be undone.')) {
      return
    }
    setMessage(null)
    try {
      await deleteQuestion(question.id)
      setMessage({ type: 'success', text: 'Question deleted.' })
      refresh()
    } catch (deleteError) {
      setMessage({ type: 'error', text: deleteError.message })
    }
  }

  if (topicResult.isLoading) {
    return <Loading message="Loading topic..." />
  }
  if (topicResult.error) {
    return <LoadError error={topicResult.error} onRetry={topicResult.reload} />
  }

  const topic = topicResult.data
  const questions = questionsResult.data

  // { questionId: [records of students who did or asked about it] }
  const recordsByQuestion = {}
  for (const record of recordsResult.data ?? []) {
    recordsByQuestion[record.question] = [...(recordsByQuestion[record.question] ?? []), record]
  }

  return (
    <>
      <PageHeader
        title={`Practice questions: ${topic.title}`}
        subtitle={topic.course_title}
        backTo={`/admin/courses/${topic.course}`}
        backLabel={`Back to ${topic.course_title}`}
      >
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setEditingQuestion('new')}
          disabled={editingQuestion !== null}
        >
          + New question
        </button>
      </PageHeader>

      {message && <Alert type={message.type}>{message.text}</Alert>}

      {editingQuestion === 'new' && (
        <QuestionForm
          topicId={topic.id}
          defaultDifficulty={difficulty}
          nextOrder={topic.question_count + 1}
          onSaved={handleSaved}
          onCancel={() => setEditingQuestion(null)}
        />
      )}

      <DifficultyTabs selected={difficulty} counts={topic} onSelect={setDifficulty} />

      {questionsResult.isLoading && <Loading message="Loading questions..." />}
      {questionsResult.error && <LoadError error={questionsResult.error} onRetry={questionsResult.reload} />}

      {questions && questions.length === 0 && (
        <p className="empty-state">No {difficulty} questions yet. Click “New question” to add one.</p>
      )}

      {questions &&
        questions.map((question, index) =>
          editingQuestion?.id === question.id ? (
            <QuestionForm
              key={question.id}
              initialQuestion={question}
              topicId={topic.id}
              onSaved={handleSaved}
              onCancel={() => setEditingQuestion(null)}
            />
          ) : (
            <div key={question.id} className="card question-card">
              <div className="question-header">
                <span className="question-label">
                  Question {index + 1} · order {question.order}
                </span>
                <StatusBadge status={question.difficulty} />
                <div className="table-actions push-right">
                  <button
                    type="button"
                    className="btn btn-secondary btn-small"
                    onClick={() => setEditingQuestion(question)}
                    disabled={editingQuestion !== null}
                  >
                    Edit
                  </button>
                  <button type="button" className="btn btn-danger btn-small" onClick={() => handleDelete(question)}>
                    Delete
                  </button>
                </div>
              </div>
              <p className="question-text">{question.text}</p>
              {question.answer ? (
                <pre className="answer-box">{question.answer}</pre>
              ) : (
                <p className="field-hint">No answer added.</p>
              )}
              {canSeeStudents && (
                <QuestionStudentActivity
                  records={recordsByQuestion[question.id] ?? []}
                  isOpen={openActivityId === question.id}
                  onToggle={() => setOpenActivityId((currentId) => (currentId === question.id ? null : question.id))}
                />
              )}
            </div>
          ),
        )}
    </>
  )
}

export default ManageQuestionsPage
