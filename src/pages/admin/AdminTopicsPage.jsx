import { Plus, Search } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import Alert from '../../components/Alert'
import DifficultyCounts from '../../components/DifficultyCounts'
import FormField from '../../components/FormField'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import TopicForm from '../../components/TopicForm'
import { useApiData } from '../../hooks/useApiData'
import { deleteTopic, getAllTopics, getCourses } from '../../services/courseService'

const NEW_TOPIC = { title: '', description: '', order: 1 }

// Admin: topics of every course in one table.
function AdminTopicsPage() {
  const [searchParams] = useSearchParams()
  const [courseId, setCourseId] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  // ?new=1 (from the dashboard's Quick Actions) opens the form straight away.
  const [formTopic, setFormTopic] = useState(() => (searchParams.get('new') === '1' ? NEW_TOPIC : null))
  const [message, setMessage] = useState(null)

  const { data: courses } = useApiData(getCourses)
  const loadTopics = useCallback(() => getAllTopics({ course: courseId, search }), [courseId, search])
  const { data: topics, error, isLoading, reload } = useApiData(loadTopics, { keepPreviousData: true })

  function handleSaved(savedTopic, isNew) {
    setFormTopic(null)
    setMessage({ type: 'success', text: `Topic "${savedTopic.title}" was ${isNew ? 'created' : 'updated'}.` })
    reload()
  }

  async function handleDelete(topic) {
    if (!window.confirm(`Delete "${topic.title}" with ALL its questions and videos? This cannot be undone.`)) {
      return
    }
    setMessage(null)
    try {
      await deleteTopic(topic.id)
      setMessage({ type: 'success', text: `Topic "${topic.title}" was deleted.` })
      reload()
    } catch (deleteError) {
      setMessage({ type: 'error', text: deleteError.message })
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault()
    setSearch(searchInput.trim())
  }

  return (
    <>
      <PageHeader title="Topics" subtitle="Every topic in every course." backTo="/admin" backLabel="Dashboard">
        <button type="button" className="btn btn-primary" onClick={() => setFormTopic(NEW_TOPIC)} disabled={Boolean(formTopic)}>
          <Plus size={16} aria-hidden="true" /> New topic
        </button>
      </PageHeader>

      {message && <Alert type={message.type}>{message.text}</Alert>}

      {formTopic && !formTopic.id && courses && (
        <TopicForm
          key="new"
          initialTopic={formTopic}
          courseId={formTopic.course ?? courseId}
          courses={courses}
          onSaved={handleSaved}
          onCancel={() => setFormTopic(null)}
        />
      )}

      <div className="filters-row">
        <FormField label="Course" htmlFor="admin-topics-course">
          <select id="admin-topics-course" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
            <option value="">All courses</option>
            {(courses ?? []).map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </FormField>
        <form className="search-form" onSubmit={handleSearchSubmit} role="search">
          <input
            type="search"
            placeholder="Search topics"
            aria-label="Search topics"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <button type="submit" className="btn btn-secondary">
            <Search size={16} aria-hidden="true" /> Search
          </button>
        </form>
      </div>

      {isLoading && !topics && <Loading message="Loading topics..." />}
      {error && <LoadError error={error} onRetry={reload} />}

      {topics && topics.length === 0 && <p className="empty-state">No topics match. Click “New topic” to add one.</p>}

      {topics && topics.length > 0 && (
        <div className={`table-wrapper ${isLoading ? 'chart-refreshing' : ''}`}>
          <table>
            <thead>
              <tr>
                <th>Topic</th>
                <th>Course</th>
                <th>Practice questions</th>
                <th className="numeric">Videos</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                formTopic?.id === topic.id ? (
                  <tr key={topic.id} className="editing-row">
                    <td colSpan="5" style={{ padding: '0' }}>
                      <div style={{ padding: '16px', background: 'var(--bg-muted)', borderLeft: '4px solid var(--color-primary)' }}>
                        <TopicForm
                          initialTopic={formTopic}
                          courseId={formTopic.course ?? courseId}
                          courses={courses}
                          onSaved={handleSaved}
                          onCancel={() => setFormTopic(null)}
                        />
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={topic.id}>
                    <td>
                      <strong>{topic.title}</strong>
                      {topic.description && <span className="cell-sub">{topic.description}</span>}
                    </td>
                    <td>
                      <Link to={`/admin/courses/${topic.course}`}>{topic.course_title}</Link>
                    </td>
                    <td>
                      <DifficultyCounts topic={topic} />
                    </td>
                    <td className="numeric">{topic.video_count}</td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/admin/topics/${topic.id}/questions`} className="btn btn-primary btn-small">
                          Questions
                        </Link>
                        <Link to={`/admin/topics/${topic.id}/videos`} className="btn btn-secondary btn-small">
                          Videos
                        </Link>
                        <button type="button" className="btn btn-secondary btn-small" onClick={() => setFormTopic(topic)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-danger btn-small" onClick={() => handleDelete(topic)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default AdminTopicsPage
