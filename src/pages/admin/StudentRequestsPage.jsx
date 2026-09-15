import { MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import Alert from '../../components/Alert'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import { useApiData } from '../../hooks/useApiData'
import { approveStudent, getStudents, rejectStudent } from '../../services/adminService'
import { getCourses } from '../../services/courseService'
import { formatDate, getFullName } from '../../utils/format'

function loadPendingStudents() {
  return getStudents({ status: 'pending' })
}

function StudentRequestsPage() {
  const { data: students, error, isLoading, reload } = useApiData(loadPendingStudents)
  const { data: courses } = useApiData(getCourses)
  const [message, setMessage] = useState(null)
  const [busyStudentId, setBusyStudentId] = useState(null)
  
  // State for the inline course selection form
  const [approvingStudentId, setApprovingStudentId] = useState(null)
  const [selectedCourses, setSelectedCourses] = useState([])

  function startApproval(student) {
    setApprovingStudentId(student.id)
    setSelectedCourses([]) // start with no courses selected
  }

  function handleCourseToggle(courseId) {
    setSelectedCourses((current) => 
      current.includes(courseId) 
        ? current.filter(id => id !== courseId)
        : [...current, courseId]
    )
  }

  async function confirmApproval(student) {
    setMessage(null)
    setBusyStudentId(student.id)
    try {
      await approveStudent(student.id, { allowed_courses: selectedCourses })
      setMessage({ type: 'success', text: `${getFullName(student)} was approved and can now log in.` })
      setApprovingStudentId(null)
      reload()
    } catch (actionError) {
      setMessage({ type: 'error', text: actionError.message })
    } finally {
      setBusyStudentId(null)
    }
  }

  async function handleReject(student) {
    if (!window.confirm(`Reject the request from ${getFullName(student)}?`)) {
      return
    }
    setMessage(null)
    setBusyStudentId(student.id)
    try {
      await rejectStudent(student.id)
      setMessage({ type: 'info', text: `The request from ${getFullName(student)} was rejected.` })
      reload()
    } catch (actionError) {
      setMessage({ type: 'error', text: actionError.message })
    } finally {
      setBusyStudentId(null)
    }
  }

  return (
    <>
      <PageHeader title="Pending student requests" subtitle="Students who asked for access and are waiting for a decision." backTo="/admin" backLabel="Dashboard">
        <Link to="/admin/students" className="btn btn-secondary">
          All students
        </Link>
      </PageHeader>

      {message && <Alert type={message.type}>{message.text}</Alert>}
      {isLoading && <Loading message="Loading requests..." />}
      {error && <LoadError error={error} onRetry={reload} />}

      {students && students.length === 0 && <p className="empty-state">No pending requests. You are all caught up!</p>}

      {students &&
        students.map((student) => (
          <div key={student.id} className="card request-card">
            <div className="request-info">
              <h3>{getFullName(student)}</h3>
              <p className="muted">
                @{student.username} · {student.email} · requested {formatDate(student.date_joined)}
                {student.whatsapp_number && (
                  <>
                    {' · '}
                    <a
                      href={`https://api.whatsapp.com/send/?phone=${student.whatsapp_number.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--color-success)' }}
                    >
                      <MessageCircle size={13} aria-hidden="true" />
                      {student.whatsapp_number}
                    </a>
                  </>
                )}
              </p>
              {student.request_message && <blockquote className="request-message">{student.request_message}</blockquote>}
            </div>
            <div className="table-actions">
              {approvingStudentId === student.id ? (
                <div style={{ width: '100%', marginTop: '16px' }}>
                  <p style={{ fontWeight: 600, marginBottom: '8px' }}>Select courses for this student:</p>
                  <div style={{ display: 'grid', gap: '8px', marginBottom: '16px', maxHeight: '150px', overflowY: 'auto', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                    {courses ? courses.map(course => (
                      <label key={course.id} className="checkbox-field" style={{ margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course.id)}
                          onChange={() => handleCourseToggle(course.id)}
                        />
                        {course.title}
                      </label>
                    )) : 'Loading courses...'}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => confirmApproval(student)}
                      disabled={busyStudentId === student.id}
                    >
                      Confirm Approval
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setApprovingStudentId(null)}
                      disabled={busyStudentId === student.id}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => startApproval(student)}
                    disabled={busyStudentId === student.id || approvingStudentId !== null}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleReject(student)}
                    disabled={busyStudentId === student.id || approvingStudentId !== null}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
    </>
  )
}

export default StudentRequestsPage
