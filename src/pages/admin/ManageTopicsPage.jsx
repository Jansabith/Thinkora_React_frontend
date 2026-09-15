import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router'
import Alert from '../../components/Alert'
import DifficultyCounts from '../../components/DifficultyCounts'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import TopicForm from '../../components/TopicForm'
import { useApiData } from '../../hooks/useApiData'
import { deleteTopic, getCourse, getTopics } from '../../services/courseService'

// One course: its topics, and links to each topic's questions and videos.
function ManageTopicsPage() {
  const { courseId } = useParams()

  const loadData = useCallback(async () => {
    const [course, topics] = await Promise.all([getCourse(courseId), getTopics(courseId)])
    return { course, topics }
  }, [courseId])

  const { data, error, isLoading, reload } = useApiData(loadData)
  // null = form closed; otherwise the topic being created or edited
  const [formTopic, setFormTopic] = useState(null)
  const [message, setMessage] = useState(null)

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

  if (isLoading) {
    return <Loading message="Loading topics..." />
  }
  if (error) {
    return <LoadError error={error} onRetry={reload} />
  }

  const { course, topics } = data

  return (
    <>
      <PageHeader
        title={course.title}
        subtitle="Topics organise every section of the course: practice questions and videos."
        backTo="/admin/courses"
        backLabel="All courses"
      >
        <StatusBadge status={course.is_published ? 'published' : 'draft'} />
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setFormTopic({ title: '', description: '', syllabus_points: [], order: topics.length + 1 })}
          disabled={Boolean(formTopic)}
        >
          + New topic
        </button>
      </PageHeader>

      {message && <Alert type={message.type}>{message.text}</Alert>}

      {formTopic && (
        <TopicForm
          key={formTopic.id ?? 'new'}
          initialTopic={formTopic}
          courseId={course.id}
          onSaved={handleSaved}
          onCancel={() => setFormTopic(null)}
        />
      )}

      {topics.length === 0 ? (
        <p className="empty-state">No topics yet. Click “New topic” to add the first one.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Topic</th>
                <th>Practice questions</th>
                <th>Videos</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                <tr key={topic.id}>
                  <td>{topic.order}</td>
                  <td>
                    <strong>{topic.title}</strong>
                    {topic.description && <span className="cell-sub">{topic.description}</span>}
                  </td>
                  <td>
                    <DifficultyCounts topic={topic} />
                  </td>
                  <td>{topic.video_count}</td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/admin/topics/${topic.id}/questions`} className="btn btn-primary btn-small">
                        Questions
                      </Link>
                      <Link to={`/admin/topics/${topic.id}/videos`} className="btn btn-primary btn-small">
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default ManageTopicsPage
