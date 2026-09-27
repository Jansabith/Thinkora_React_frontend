import { useState } from 'react'
import { useApiData } from '../hooks/useApiData'
import { updateStudent } from '../services/adminService'
import { getCourses } from '../services/courseService'
import Alert from './Alert'
import LoadError from './LoadError'
import Loading from './Loading'
import StatusBadge from './StatusBadge'

// Admin: choose which courses ONE student may open.
//
// A student sees NOTHING until a course is ticked here, so this is its own
// section rather than being buried inside the account form.
function StudentCourseAccessForm({ student, onSaved }) {
  const [allowed, setAllowed] = useState(() => new Set(student.allowed_courses ?? []))
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const { data: courses, error: loadError, isLoading, reload } = useApiData(getCourses)

  function toggleCourse(courseId) {
    setAllowed((current) => {
      const next = new Set(current)
      if (next.has(courseId)) {
        next.delete(courseId)
      } else {
        next.add(courseId)
      }
      return next
    })
  }

  function setAll(courseIds) {
    setAllowed(new Set(courseIds))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSaving(true)
    try {
      // Only allowed_courses is sent, so nothing else about the student changes.
      await updateStudent(student.id, { allowed_courses: [...allowed] })
      onSaved(
        allowed.size === 0
          ? 'Course access saved. This student can now see no courses.'
          : `Course access saved. This student can see ${allowed.size} course(s).`,
      )
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <Loading message="Loading courses..." variant="list" count={3} />
  }
  if (loadError) {
    return <LoadError error={loadError} onRetry={reload} />
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert type="error">{error}</Alert>}

      {allowed.size === 0 && (
        <Alert type="info">
          This student cannot see any course yet. Tick at least one below, or their whole LMS stays empty.
        </Alert>
      )}

      {courses.length === 0 ? (
        <p className="empty-state">There are no courses yet.</p>
      ) : (
        <>
          <div className="course-access-toolbar">
            <p className="field-hint">Tick every course this student is allowed to open.</p>
            <span className="course-access-bulk">
              <button type="button" className="btn btn-secondary btn-small" onClick={() => setAll(courses.map((course) => course.id))}>
                Select all
              </button>
              <button type="button" className="btn btn-secondary btn-small" onClick={() => setAll([])}>
                Clear all
              </button>
            </span>
          </div>

          <ul className="course-access-list">
            {courses.map((course) => (
              <li key={course.id}>
                <label className={`course-access-item ${allowed.has(course.id) ? 'is-allowed' : ''}`}>
                  <input type="checkbox" checked={allowed.has(course.id)} onChange={() => toggleCourse(course.id)} />
                  <span className="course-access-text">
                    <span className="course-access-title">
                      {course.title}
                      {!course.is_published && <StatusBadge status="draft" />}
                    </span>
                    <span className="course-access-meta muted">
                      {course.category || 'Uncategorized'} · {course.topic_count} topics · {course.question_count} questions
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save course access'}
        </button>
      </div>
    </form>
  )
}

export default StudentCourseAccessForm
