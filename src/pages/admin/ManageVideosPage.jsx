import { useCallback, useState } from 'react'
import { useParams } from 'react-router'
import Alert from '../../components/Alert'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import VideoForm from '../../components/VideoForm'
import { useApiData } from '../../hooks/useApiData'
import { getTopic } from '../../services/courseService'
import { deleteVideo, getVideos } from '../../services/videoService'

// Admin: add, edit and delete the videos of one topic.
function ManageVideosPage() {
  const { topicId } = useParams()

  const loadData = useCallback(async () => {
    const [topic, videos] = await Promise.all([getTopic(topicId), getVideos(topicId)])
    return { topic, videos }
  }, [topicId])

  const { data, error, isLoading, reload } = useApiData(loadData)
  // null = no form open; 'new' = adding; a video object = editing that video
  const [editingVideo, setEditingVideo] = useState(null)
  const [message, setMessage] = useState(null)

  function handleSaved(savedVideo, isNew) {
    setEditingVideo(null)
    setMessage({ type: 'success', text: `Video "${savedVideo.title}" was ${isNew ? 'added' : 'updated'}.` })
    reload()
  }

  async function handleDelete(video) {
    if (!window.confirm(`Delete the video "${video.title}"?`)) {
      return
    }
    setMessage(null)
    try {
      await deleteVideo(video.id)
      setMessage({ type: 'success', text: `Video "${video.title}" was deleted.` })
      reload()
    } catch (deleteError) {
      setMessage({ type: 'error', text: deleteError.message })
    }
  }

  if (isLoading) {
    return <Loading message="Loading videos..." />
  }
  if (error) {
    return <LoadError error={error} onRetry={reload} />
  }

  const { topic, videos } = data

  return (
    <>
      <PageHeader
        title={`Videos: ${topic.title}`}
        subtitle={topic.course_title}
        backTo={`/admin/courses/${topic.course}`}
        backLabel={`Back to ${topic.course_title}`}
      >
        <button type="button" className="btn btn-primary" onClick={() => setEditingVideo('new')} disabled={editingVideo !== null}>
          + New video
        </button>
      </PageHeader>

      {message && <Alert type={message.type}>{message.text}</Alert>}

      {editingVideo === 'new' && (
        <VideoForm
          topicId={topic.id}
          nextOrder={videos.length + 1}
          onSaved={handleSaved}
          onCancel={() => setEditingVideo(null)}
        />
      )}

      {videos.length === 0 && <p className="empty-state">No videos yet. Click “New video” to add one.</p>}

      {videos.map((video) =>
        editingVideo?.id === video.id ? (
          <VideoForm
            key={video.id}
            initialVideo={video}
            topicId={topic.id}
            onSaved={handleSaved}
            onCancel={() => setEditingVideo(null)}
          />
        ) : (
          <div key={video.id} className="card video-admin-row">
            <div>
              <h3>{video.title}</h3>
              <a href={video.url} target="_blank" rel="noopener noreferrer" className="cell-sub">
                {video.url}
              </a>
              <span className="cell-sub">
                Order {video.order} · {video.embed_url ? 'Plays inside the page (YouTube)' : 'Opens in a new tab'}
              </span>
            </div>
            <div className="table-actions">
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={() => setEditingVideo(video)}
                disabled={editingVideo !== null}
              >
                Edit
              </button>
              <button type="button" className="btn btn-danger btn-small" onClick={() => handleDelete(video)}>
                Delete
              </button>
            </div>
          </div>
        ),
      )}
    </>
  )
}

export default ManageVideosPage
