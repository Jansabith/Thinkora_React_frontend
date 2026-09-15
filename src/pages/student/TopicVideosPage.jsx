import { useCallback } from 'react'
import { useParams } from 'react-router'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import VideoCard from '../../components/VideoCard'
import { useApiData } from '../../hooks/useApiData'
import { getTopic } from '../../services/courseService'
import { getVideos } from '../../services/videoService'

// Videos of one topic.
function TopicVideosPage() {
  const { topicId } = useParams()

  const loadData = useCallback(async () => {
    const [topic, videos] = await Promise.all([getTopic(topicId), getVideos(topicId)])
    return { topic, videos }
  }, [topicId])

  const { data, error, isLoading, reload } = useApiData(loadData)

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
        title={topic.title}
        subtitle={`${topic.course_title} · Videos`}
        backTo={`/student/courses/${topic.course}/videos`}
        backLabel="All topics"
      />

      {topic.description && <p className="topic-description">{topic.description}</p>}

      {videos.length === 0 ? (
        <p className="empty-state">No videos for this topic yet.</p>
      ) : (
        <div className="video-grid">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </>
  )
}

export default TopicVideosPage
