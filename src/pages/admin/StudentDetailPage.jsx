import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import Alert from '../../components/Alert'
import Collapsible from '../../components/Collapsible'
import FilterTabs from '../../components/FilterTabs'
import FormField from '../../components/FormField'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import ProgressBar from '../../components/ProgressBar'
import ProgressRecordList from '../../components/ProgressRecordList'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'
import StudentAccountForm from '../../components/StudentAccountForm'
import StudentCourseAccessForm from '../../components/StudentCourseAccessForm'
import { useApiData } from '../../hooks/useApiData'
import {
  approveStudent,
  assignQuestionsToStudent,
  deleteStudent,
  getAssignedQuestionIdsForStudent,
  rejectStudent,
} from '../../services/adminService'
import { apiRequest } from '../../services/api'
import { getCourses, getTopics } from '../../services/courseService'
import { getProgressRecords, getStudentProgress } from '../../services/progressService'
import { getAllQuestions } from '../../services/questionService'
import { formatDate, formatDateTime, getFullName, percent, pluralize } from '../../utils/format'

const ACTIVITY_FILTERS = [
  { value: '', label: 'All activity' },
  { value: 'done', label: 'Done' },
  { value: 'open', label: 'Open doubts' },
  { value: 'resolved', label: 'Answered doubts' },
]

const PAGE_SIZE = 20

function AssignQuestionsPanel({ studentId, onAssigned }) {
  const [courseId, setCourseId] = useState('')
  const [topicId, setTopicId] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [questions, setQuestions] = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [alreadyAssigned, setAlreadyAssigned] = useState(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const { data: courses } = useApiData(getCourses)
  const loadTopics = useCallback(() => (courseId ? getTopics(courseId) : Promise.resolve([])), [courseId])
  const { data: topics } = useApiData(loadTopics)

  const loadAssigned = useCallback(async () => {
    try {
      const response = await getAssignedQuestionIdsForStudent(studentId)
      setAlreadyAssigned(new Set(response.assigned_question_ids))
    } catch (loadError) {
      setError(loadError.message)
    }
  }, [studentId])

  useEffect(() => {
    loadAssigned()
  }, [loadAssigned])

  // Any change of filter starts again at page 1.
  const loadQuestions = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getAllQuestions({ page, course: courseId, topic: topicId, difficulty })
      setQuestions(data.results ?? [])
      setTotalPages(Math.ceil((data.count ?? 0) / PAGE_SIZE) || 1)
    } catch (loadError) {
      setError(loadError.message)
      setQuestions([])
    } finally {
      setIsLoading(false)
    }
  }, [page, courseId, topicId, difficulty])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  function changeFilter(setter, value) {
    setter(value)
    setPage(1)
  }

  function toggleQuestion(questionId) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(questionId)) {
        next.delete(questionId)
      } else {
        next.add(questionId)
      }
      return next
    })
  }

  async function handleSave() {
    if (selectedIds.size === 0) {
      return
    }
    setIsSaving(true)
    setError('')
    try {
      const response = await assignQuestionsToStudent(studentId, [...selectedIds])
      onAssigned(response.message)
      setSelectedIds(new Set())
      loadAssigned()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {error && <Alert type="error">{error}</Alert>}

      <div className="form-row">
        <FormField label="Course" htmlFor="assign-course">
          <select
            id="assign-course"
            value={courseId}
            onChange={(event) => {
              changeFilter(setCourseId, event.target.value)
              setTopicId('')
            }}
          >
            <option value="">All courses</option>
            {(courses ?? []).map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Topic" htmlFor="assign-topic">
          <select
            id="assign-topic"
            value={topicId}
            onChange={(event) => changeFilter(setTopicId, event.target.value)}
            disabled={!courseId}
          >
            <option value="">{courseId ? 'All topics' : 'Choose a course first'}</option>
            {(topics ?? []).map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Difficulty" htmlFor="assign-difficulty">
          <select
            id="assign-difficulty"
            value={difficulty}
            onChange={(event) => changeFilter(setDifficulty, event.target.value)}
          >
            <option value="">Any difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </FormField>
      </div>

      {isLoading && <Loading message="Loading questions..." variant="list" count={4} />}
      {!isLoading && questions.length === 0 && <p className="empty-state">No questions match these filters.</p>}

      {!isLoading && questions.length > 0 && (
        <>
          <div className="table-wrapper table-flat assign-question-table">
            <table>
              <thead>
                <tr>
                  <th className="assign-pick-column"><span className="sr-only">Choose</span></th>
                  <th>Question</th>
                  <th>Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question.id}>
                    <td>
                      {alreadyAssigned.has(question.id) ? (
                        <span className="badge badge-success">Assigned</span>
                      ) : (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(question.id)}
                          onChange={() => toggleQuestion(question.id)}
                          aria-label={`Assign: ${question.text.slice(0, 60)}`}
                        />
                      )}
                    </td>
                    <td>{question.text}</td>
                    <td>
                      <StatusBadge status={question.difficulty} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="assign-pagination">
              <button
                type="button"
                className="btn btn-secondary btn-small"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </button>
              <span className="muted">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-small"
                disabled={page === totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={selectedIds.size === 0 || isSaving}
        >
          {isSaving ? 'Assigning...' : `Assign ${selectedIds.size} question(s)`}
        </button>
      </div>
    </>
  )
}

// One course, closed by default. The closed row already shows the progress,
// so an admin can scan every course without opening anything.
function CourseProgressSection({ course, studentId, onChanged, onViewActivity }) {
  const [busyTopicId, setBusyTopicId] = useState(null)
  const [error, setError] = useState('')

  async function toggleUnlock(topic) {
    setBusyTopicId(topic.id)
    setError('')
    try {
      await apiRequest(`/admin/students/${studentId}/topics/${topic.id}/unlock/`, {
        method: 'POST',
        body: { unlock: !topic.admin_unlocked },
      })
      onChanged()
    } catch (unlockError) {
      setError(unlockError.message)
    } finally {
      setBusyTopicId(null)
    }
  }

  return (
    <Collapsible
      title={
        <>
          {course.title}
          {!course.is_published && <StatusBadge status="draft" />}
        </>
      }
      subtitle={`${course.done_count} of ${course.question_count} questions done · ${pluralize(course.topics.length, 'topic')}`}
      meta={
        <>
          {course.open_doubt_count > 0 && (
            <span className="badge badge-open">{pluralize(course.open_doubt_count, 'open doubt')}</span>
          )}
          <span className="collapsible-percent">{percent(course.done_count, course.question_count)}%</span>
          <ProgressBar value={course.done_count} max={course.question_count} label={`${course.title} progress`} />
        </>
      }
    >
      {error && <Alert type="error">{error}</Alert>}

      <ul className="topic-rows">
        {course.topics.map((topic) => (
          <li key={topic.id} className="topic-row">
            <div className="topic-row-main">
              <strong>{topic.title}</strong>
              <span className="topic-row-counts muted">
                <span>
                  <strong>{topic.done_count}</strong> / {topic.question_count} done
                </span>
                {topic.open_doubt_count > 0 && <span className="badge badge-open">{topic.open_doubt_count} open</span>}
                {topic.resolved_doubt_count > 0 && (
                  <span className="badge badge-success">{topic.resolved_doubt_count} answered</span>
                )}
                {topic.admin_unlocked && <span className="badge badge-new">Unlocked</span>}
              </span>
            </div>

            <div className="topic-row-progress">
              <ProgressBar value={topic.done_count} max={topic.question_count} label={`${topic.title} progress`} />
            </div>

            <div className="topic-row-actions">
              <button
                type="button"
                className={`btn btn-small ${topic.admin_unlocked ? 'btn-danger' : 'btn-success'}`}
                disabled={busyTopicId === topic.id}
                onClick={() => toggleUnlock(topic)}
              >
                {busyTopicId === topic.id ? 'Saving...' : topic.admin_unlocked ? 'Revoke access' : 'Unlock topic'}
              </button>
              <button type="button" className="btn btn-secondary btn-small" onClick={() => onViewActivity(topic)}>
                View activity
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Collapsible>
  )
}

// Admin: everything about ONE student — access, progress, doubts and account.
// Every long section starts closed, so the page stays short no matter how much
// work the student has done or how many courses exist.
function StudentDetailPage() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState(null)
  const [isBusy, setIsBusy] = useState(false)
  const [isActivityOpen, setIsActivityOpen] = useState(false)

  const loadOverview = useCallback(() => getStudentProgress(studentId), [studentId])
  const overviewResult = useApiData(loadOverview)

  const [activityStatus, setActivityStatus] = useState('')
  const [activityTopic, setActivityTopic] = useState(null) // { id, title } or null
  const loadActivity = useCallback(
    () => getProgressRecords({ student: studentId, status: activityStatus, topic: activityTopic?.id }),
    [studentId, activityStatus, activityTopic],
  )
  const activityResult = useApiData(loadActivity)

  const refreshAll = useCallback(() => {
    overviewResult.reload()
    activityResult.reload()
  }, [overviewResult, activityResult])

  function showTopicActivity(topic) {
    setActivityTopic({ id: topic.id, title: topic.title })
    setIsActivityOpen(true)
    // Wait for the section to open before scrolling, or we scroll to the closed row.
    requestAnimationFrame(() => document.getElementById('activity')?.scrollIntoView({ behavior: 'smooth' }))
  }

  async function runAccessAction(action, successText) {
    setMessage(null)
    setIsBusy(true)
    try {
      await action(studentId)
      setMessage({ type: 'success', text: successText })
      overviewResult.reload()
    } catch (actionError) {
      setMessage({ type: 'error', text: actionError.message })
    } finally {
      setIsBusy(false)
    }
  }

  async function handleDelete(student) {
    if (!window.confirm(`Delete ${getFullName(student)} and ALL their progress? This cannot be undone.`)) {
      return
    }
    setIsBusy(true)
    try {
      await deleteStudent(studentId)
      navigate('/admin/students')
    } catch (deleteError) {
      setMessage({ type: 'error', text: deleteError.message })
      setIsBusy(false)
    }
  }

  if (overviewResult.isLoading) {
    return <Loading message="Loading student..." variant="stats" count={6} />
  }
  if (overviewResult.error) {
    return <LoadError error={overviewResult.error} onRetry={overviewResult.reload} />
  }

  const { student, summary, courses } = overviewResult.data
  const name = getFullName(student)
  const activityCount = activityResult.data?.length ?? 0
  const allowedCount = student.allowed_courses?.length ?? 0

  return (
    <>
      <PageHeader
        title={name}
        subtitle={`@${student.username} · ${student.email}${student.whatsapp_number ? ` · ${student.whatsapp_number}` : ''}`}
        backTo="/admin/students"
        backLabel="All students"
      >
        <StatusBadge status={student.access_status} />
        {student.access_status !== 'approved' && (
          <button
            type="button"
            className="btn btn-success"
            disabled={isBusy}
            onClick={() => runAccessAction(approveStudent, `${name} was approved.`)}
          >
            Approve
          </button>
        )}
        {student.access_status !== 'rejected' && (
          <button
            type="button"
            className="btn btn-danger"
            disabled={isBusy}
            onClick={() => {
              if (window.confirm(`Remove access for ${name}? They will be logged out.`)) {
                runAccessAction(rejectStudent, `${name} no longer has access.`)
              }
            }}
          >
            {student.access_status === 'approved' ? 'Remove access' : 'Reject'}
          </button>
        )}
        <button type="button" className="btn btn-danger" disabled={isBusy} onClick={() => handleDelete(student)}>
          Delete
        </button>
      </PageHeader>

      {message && <Alert type={message.type}>{message.text}</Alert>}
      {student.request_message && (
        <Alert type="info">Message from the access request: “{student.request_message}”</Alert>
      )}

      <div className="stats-grid">
        <StatCard label="Questions done" value={`${summary.done_count} / ${summary.question_count}`} />
        <StatCard label="Open doubts" value={summary.open_doubt_count} highlight={summary.open_doubt_count > 0} />
        <StatCard label="Answered doubts" value={summary.resolved_doubt_count} />
        <StatCard label="Last activity" value={formatDateTime(summary.last_activity)} small />
        <StatCard label="Last login" value={formatDateTime(student.last_login)} small />
        <StatCard label="Joined" value={formatDate(student.date_joined)} small />
      </div>

      <h2 className="section-title">Progress by course</h2>
      {courses.length === 0 ? (
        <p className="empty-state">There are no practice questions in any course yet.</p>
      ) : (
        <div className="collapsible-group">
          {courses.map((course) => (
            <CourseProgressSection
              key={course.id}
              course={course}
              studentId={studentId}
              onChanged={refreshAll}
              onViewActivity={showTopicActivity}
            />
          ))}
        </div>
      )}

      <h2 className="section-title">More</h2>
      <div className="collapsible-group">
        <Collapsible
          id="activity"
          title="Activity"
          subtitle="Everything this student marked as done, and every doubt they asked"
          meta={isActivityOpen && <span className="muted">{pluralize(activityCount, 'record')}</span>}
          open={isActivityOpen}
          onOpenChange={setIsActivityOpen}
        >
          <div className="toolbar">
            <FilterTabs
              options={ACTIVITY_FILTERS}
              value={activityStatus}
              onChange={setActivityStatus}
              label="Filter activity"
            />
            {activityTopic && (
              <span className="filter-chip">
                Topic: {activityTopic.title}
                <button type="button" onClick={() => setActivityTopic(null)} aria-label="Show every topic again">
                  ×
                </button>
              </span>
            )}
          </div>
          {activityResult.isLoading && <Loading message="Loading activity..." variant="list" count={4} />}
          {activityResult.error && <LoadError error={activityResult.error} onRetry={activityResult.reload} />}
          {activityResult.data && (
            <ProgressRecordList
              records={activityResult.data}
              onChanged={refreshAll}
              emptyText="Nothing here yet. Activity appears when the student clicks Done or Doubt."
            />
          )}
        </Collapsible>

        <Collapsible
          title="Course access"
          subtitle="Which courses this student is allowed to open"
          meta={
            <span className={allowedCount === 0 ? 'badge badge-open' : 'muted'}>
              {allowedCount === 0 ? 'No courses' : pluralize(allowedCount, 'course')}
            </span>
          }
        >
          <StudentCourseAccessForm
            key={student.id}
            student={student}
            onSaved={(text) => {
              setMessage({ type: 'success', text })
              overviewResult.reload()
            }}
          />
        </Collapsible>

        <Collapsible title="Account" subtitle="Name, email, WhatsApp and password">
          <StudentAccountForm
            key={student.id}
            student={student}
            onSaved={(text) => {
              setMessage({ type: 'success', text })
              overviewResult.reload()
            }}
          />
        </Collapsible>

        <Collapsible title="Assign questions" subtitle="Hand-pick questions for this student to practise">
          <AssignQuestionsPanel
            studentId={studentId}
            onAssigned={(text) => {
              setMessage({ type: 'success', text })
              refreshAll()
            }}
          />
        </Collapsible>
      </div>
    </>
  )
}

export default StudentDetailPage
