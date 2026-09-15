import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import Alert from '../../components/Alert'
import CourseForm from '../../components/CourseForm'
import CourseIcon from '../../components/CourseIcon'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import { useApiData } from '../../hooks/useApiData'
import { deleteCourse, getCourses } from '../../services/courseService'

const NEW_COURSE = { title: '', description: '', category: '', level: 'beginner', is_published: true }

function ManageCoursesPage() {
  const [searchParams] = useSearchParams()
  const { data: courses, error, isLoading, reload } = useApiData(getCourses)
  // null = form closed; otherwise the course being created or edited. ?new=1 opens an empty form.
  const [formCourse, setFormCourse] = useState(() => (searchParams.get('new') === '1' ? NEW_COURSE : null))
  const [message, setMessage] = useState(null)

  const categories = [...new Set((courses ?? []).map((course) => course.category).filter(Boolean))].sort()

  function handleSaved(savedCourse, isNew) {
    setFormCourse(null)
    setMessage({ type: 'success', text: `Course "${savedCourse.title}" was ${isNew ? 'created' : 'updated'}.` })
    reload()
  }

  async function handleDelete(course) {
    if (!window.confirm(`Delete "${course.title}" with ALL its topics, questions and videos? This cannot be undone.`)) {
      return
    }
    setMessage(null)
    try {
      await deleteCourse(course.id)
      setMessage({ type: 'success', text: `Course "${course.title}" was deleted.` })
      reload()
    } catch (deleteError) {
      setMessage({ type: 'error', text: deleteError.message })
    }
  }

  return (
    <>
      <PageHeader title="Courses" subtitle="Create courses, then add topics, practice questions and videos." backTo="/admin" backLabel="Dashboard">
        <button type="button" className="btn btn-primary" onClick={() => setFormCourse(NEW_COURSE)} disabled={Boolean(formCourse)}>
          <Plus size={16} aria-hidden="true" /> New course
        </button>
      </PageHeader>

      {message && <Alert type={message.type}>{message.text}</Alert>}

      {formCourse && (
        <CourseForm
          key={formCourse.id ?? 'new'}
          initialCourse={formCourse}
          categories={categories}
          onSaved={handleSaved}
          onCancel={() => setFormCourse(null)}
        />
      )}

      {isLoading && <Loading message="Loading courses..." />}
      {error && <LoadError error={error} onRetry={reload} />}

      {courses && courses.length === 0 && <p className="empty-state">No courses yet. Click “New course” to create the first one.</p>}

      {courses && courses.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Category</th>
                <th>Level</th>
                <th>Status</th>
                <th className="numeric">Topics</th>
                <th className="numeric">Questions</th>
                <th className="numeric">Videos</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>
                    <div className="person-cell">
                      <CourseIcon course={course} size={38} />
                      <span>
                        <strong>{course.title}</strong>
                        {course.description && <span className="cell-sub">{course.description}</span>}
                      </span>
                    </div>
                  </td>
                  <td>{course.category || '—'}</td>
                  <td>
                    <StatusBadge status={course.level} />
                  </td>
                  <td>
                    <StatusBadge status={course.is_published ? 'published' : 'draft'} />
                  </td>
                  <td className="numeric">{course.topic_count}</td>
                  <td className="numeric">{course.question_count}</td>
                  <td className="numeric">{course.video_count}</td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/admin/courses/${course.id}`} className="btn btn-primary btn-small">
                        Topics &amp; content
                      </Link>
                      <button type="button" className="btn btn-secondary btn-small" onClick={() => setFormCourse(course)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-danger btn-small" onClick={() => handleDelete(course)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default ManageCoursesPage
