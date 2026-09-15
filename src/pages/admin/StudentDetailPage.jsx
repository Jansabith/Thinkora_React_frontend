import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import Alert from '../../components/Alert'
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
import { useApiData } from '../../hooks/useApiData'
import { assignQuestionsToStudent, getAssignedQuestionIdsForStudent } from '../../services/adminService'
import { apiRequest } from '../../services/api'
import { getCourses, getTopics } from '../../services/courseService'
import { getProgressRecords, getStudentProgress } from '../../services/progressService'
import { getAllQuestions } from '../../services/questionService'
import { formatDate, formatDateTime, getFullName, pluralize } from '../../utils/format'

const ACTIVITY_FILTERS = [
  { value: '', label: 'All activity' },
  { value: 'done', label: 'Done' },
  { value: 'open', label: 'Open doubts' },
  { value: 'resolved', label: 'Answered doubts' },
]

function AssignQuestionsPanel({ studentId, onAssigned }) {
  const [courseId, setCourseId] = useState('')
  const [topicId, setTopicId] = useState('')
  const [questions, setQuestions] = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [alreadyAssigned, setAlreadyAssigned] = useState(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { data: courses } = useApiData(getCourses)
  const loadTopics = useCallback(() => (courseId ? getTopics(courseId) : Promise.resolve([])), [courseId])
  const { data: topics } = useApiData(loadTopics)

  const fetchAssigned = async () => {
    try {
      const res = await getAssignedQuestionIdsForStudent(studentId)
      setAlreadyAssigned(new Set(res.assigned_question_ids))
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchAssigned()
  }, [studentId])

  const loadQuestions = async () => {
    if (!topicId) {
      setQuestions([])
      return
    }
    setIsLoading(true)
    try {
      const data = await getAllQuestions({ course: courseId, topic: topicId }) 
      setQuestions(data.results || [])
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadQuestions() }, [topicId])

  const handleToggle = (id) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleSave = async () => {
    if (selectedIds.size === 0) return
    setIsSaving(true)
    try {
      const res = await assignQuestionsToStudent(studentId, Array.from(selectedIds))
      onAssigned(res.message)
      setSelectedIds(new Set())
      fetchAssigned() // refresh already assigned list
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="card">
      <div className="form-row">
        <FormField label="Course" htmlFor="assign-course">
          <select id="assign-course" value={courseId} onChange={(e) => { setCourseId(e.target.value); setTopicId('') }}>
            <option value="">Choose a course</option>
            {(courses || []).map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </FormField>
        <FormField label="Topic" htmlFor="assign-topic">
          <select id="assign-topic" value={topicId} onChange={(e) => setTopicId(e.target.value)} disabled={!courseId}>
            <option value="">{courseId ? 'Choose a topic' : 'Choose course first'}</option>
            {(topics || []).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </FormField>
      </div>

      {isLoading && <p>Loading questions...</p>}
      {!isLoading && topicId && questions.length === 0 && <p className="empty-state">No questions found in this topic.</p>}

      {!isLoading && questions.length > 0 && (
        <div className="table-wrapper table-flat" style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Question</th>
                <th>Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {questions.map(q => (
                <tr key={q.id}>
                  <td>
                    {alreadyAssigned.has(q.id) ? (
                      <span className="badge badge-success" style={{ fontSize: '10px' }}>Assigned</span>
                    ) : (
                      <input type="checkbox" checked={selectedIds.has(q.id)} onChange={() => handleToggle(q.id)} />
                    )}
                  </td>
                  <td>{q.text}</td>
                  <td><StatusBadge status={q.difficulty} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="form-actions" style={{ marginTop: '1rem' }}>
        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={selectedIds.size === 0 || isSaving}>
          {isSaving ? 'Assigning...' : `Assign ${selectedIds.size} Question(s)`}
        </button>
      </div>
    </div>
  )
}

// Admin: everything about ONE student — access, progress, doubts and account.
function StudentDetailPage() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState(null)
  const [isBusy, setIsBusy] = useState(false)

  const loadOverview = useCallback(() => getStudentProgress(studentId), [studentId])
  const overviewResult = useApiData(loadOverview)

  const [activityStatus, setActivityStatus] = useState('')
  const [activityTopic, setActivityTopic] = useState(null) // { id, title } or null
  const loadActivity = useCallback(
    () => getProgressRecords({ student: studentId, status: activityStatus, topic: activityTopic?.id }),
    [studentId, activityStatus, activityTopic],
  )
  const activityResult = useApiData(loadActivity)

  function refreshAll() {
    overviewResult.reload()
    activityResult.reload()
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

  function showTopicActivity(topic) {
    setActivityTopic({ id: topic.id, title: topic.title })
    document.getElementById('activity')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (overviewResult.isLoading) {
    return <Loading message="Loading student..." />
  }
  if (overviewResult.error) {
    return <LoadError error={overviewResult.error} onRetry={overviewResult.reload} />
  }

  const { student, summary, courses } = overviewResult.data
  const name = getFullName(student)

  return (
    <>
      <PageHeader title={name} subtitle={`@${student.username} · ${student.email}${student.whatsapp_number ? ` · ${student.whatsapp_number}` : ''}`} backTo="/admin/students" backLabel="All students">
        <StatusBadge status={student.access_status} />
        {student.access_status !== 'approved' && (
          <button type="button" className="btn btn-success" disabled={isBusy} onClick={() => runAccessAction(approveStudent, `${name} was approved.`)}>
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
      {student.request_message && <Alert type="info">Message from the access request: “{student.request_message}”</Alert>}

      <div className="stats-grid">
        <StatCard label="Questions done" value={`${summary.done_count} / ${summary.question_count}`} />
        <StatCard label="Open doubts" value={summary.open_doubt_count} highlight={summary.open_doubt_count > 0} />
        <StatCard label="Answered doubts" value={summary.resolved_doubt_count} />
        <StatCard label="Last activity" value={formatDateTime(summary.last_activity)} small />
        <StatCard label="Last login" value={formatDateTime(student.last_login)} small />
        <StatCard label="Joined" value={formatDate(student.date_joined)} small />
      </div>

      <h2 className="section-title">Progress by course</h2>
      {courses.length === 0 && <p className="empty-state">There are no practice questions in any course yet.</p>}
      {courses.map((course) => (
        <div key={course.id} className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{course.title}</h3>
                {!course.is_published && <StatusBadge status="draft" />}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                 <strong>{course.done_count}</strong> out of {course.question_count} questions completed
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '200px' }}>
              {course.open_doubt_count > 0 && <span className="badge badge-open">{pluralize(course.open_doubt_count, 'open doubt')}</span>}
              <div style={{ flex: 1 }}>
                <ProgressBar value={course.done_count} max={course.question_count} label={`${course.title} progress`} showPercent />
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {course.topics.map((topic) => (
              <div key={topic.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-muted)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div>
                  <strong style={{ display: 'block', marginBottom: '6px', fontSize: '1.05rem' }}>{topic.title}</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }} className="muted">
                    <span><strong>{topic.done_count}</strong> / {topic.question_count} done</span>
                    {topic.open_doubt_count > 0 && <span className="badge badge-open" style={{ padding: '2px 6px', fontSize: '0.75rem' }}>{topic.open_doubt_count} open</span>}
                    {topic.resolved_doubt_count > 0 && <span className="badge badge-success" style={{ padding: '2px 6px', fontSize: '0.75rem' }}>{topic.resolved_doubt_count} answered</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ width: '120px' }}>
                    <ProgressBar value={topic.done_count} max={topic.question_count} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '130px' }}>
                    <button 
                      type="button" 
                      className={`btn btn-small ${topic.admin_unlocked ? 'btn-danger' : 'btn-success'}`} 
                      onClick={() => {
                        apiRequest(`/admin/students/${studentId}/topics/${topic.id}/unlock/`, { 
                          method: 'POST',
                          body: { unlock: !topic.admin_unlocked }
                        })
                          .then(() => refreshAll())
                          .catch(e => alert(e.message))
                      }}
                    >
                      {topic.admin_unlocked ? 'Revoke Access' : 'Unlock Topic'}
                    </button>
                    <button type="button" className="btn btn-secondary btn-small" onClick={() => showTopicActivity(topic)}>
                      View activity
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <h2 className="section-title" id="activity">
        Activity
      </h2>
      <div className="toolbar">
        <FilterTabs options={ACTIVITY_FILTERS} value={activityStatus} onChange={setActivityStatus} label="Filter activity" />
        {activityTopic && (
          <span className="filter-chip">
            Topic: {activityTopic.title}
            <button type="button" onClick={() => setActivityTopic(null)} aria-label="Remove topic filter">
              ×
            </button>
          </span>
        )}
      </div>
      {activityResult.isLoading && <Loading message="Loading activity..." />}
      {activityResult.error && <LoadError error={activityResult.error} onRetry={activityResult.reload} />}
      {activityResult.data && (
        <ProgressRecordList
          records={activityResult.data}
          onChanged={refreshAll}
          emptyText="Nothing here yet. Activity appears when the student clicks Done or Doubt."
        />
      )}

      <h2 className="section-title">Account</h2>
      <StudentAccountForm
        key={student.id}
        student={student}
        onSaved={(text) => {
          setMessage({ type: 'success', text })
          overviewResult.reload()
        }}
      />
      <h2 className="section-title">Assign Questions</h2>
      <AssignQuestionsPanel 
        studentId={studentId} 
        onAssigned={(msg) => { setMessage({ type: 'success', text: msg }); refreshAll() }} 
      />

    </>
  )
}

export default StudentDetailPage
