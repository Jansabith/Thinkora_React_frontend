import { useCallback } from 'react'
import { Link, useParams } from 'react-router'
import { useApiData } from '../../hooks/useApiData'
import { getCourse, getTopics } from '../../services/courseService'
import PageHeader from '../../components/PageHeader'
import Loading from '../../components/Loading'
import LoadError from '../../components/LoadError'
import { apiRequest } from '../../services/api'
import './roadmap.css'

function CourseRoadmapPage() {
  const { courseId } = useParams()

  const loadData = useCallback(async () => {
    const [course, topics] = await Promise.all([getCourse(courseId), getTopics(courseId)])
    return { course, topics }
  }, [courseId])

  const { data, error, isLoading, reload } = useApiData(loadData)

  const handleCompleteTopic = async (topicId) => {
    try {
      await apiRequest(`/progress/topics/${topicId}/complete/`, { method: 'POST' })
      reload()
    } catch (e) {
      console.error(e)
      alert('Failed to mark topic as complete.')
    }
  }

  if (isLoading) return <Loading message="Loading roadmap..." />
  if (error) return <LoadError error={error} onRetry={reload} />

  const { course, topics } = data

  return (
    <>
      <PageHeader
        title={`${course.title} Roadmap`}
        subtitle="Follow the steps to master the course. You must complete a topic to unlock the next one."
        backTo={`/student/courses/${course.id}`}
        backLabel={course.title}
      />

      <div className="roadmap-container">
        {topics.length === 0 ? (
          <p className="empty-state">No topics in this course yet.</p>
        ) : (
          <div className="roadmap-timeline">
            {topics.map((topic, index) => {
              const isLocked = topic.is_locked
              const isCompleted = topic.is_completed

              let statusClass = 'topic-locked'
              if (isCompleted) statusClass = 'topic-completed'
              else if (!isLocked) statusClass = 'topic-active'

              return (
                <div key={topic.id} className={`roadmap-node ${statusClass}`}>
                  <div className="roadmap-marker">
                    {isCompleted ? '✓' : isLocked ? '🔒' : index + 1}
                  </div>
                  <div className="roadmap-card card">
                    <h3>{topic.title}</h3>
                    <p>{topic.description || 'Complete this topic to move forward.'}</p>
                    
                    {Array.isArray(topic.syllabus_points) && topic.syllabus_points.length > 0 && (
                      <ul className="roadmap-syllabus-list">
                        {topic.syllabus_points.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    )}
                    
                    <div className="roadmap-actions">
                      {!isLocked ? (
                        <>
                          <div className="btn-group">
                            <Link to={`/student/topics/${topic.id}/videos`} className="btn btn-secondary btn-small">
                              Watch Videos
                            </Link>
                            <Link to={`/student/topics/${topic.id}/questions`} className="btn btn-secondary btn-small">
                              Practice
                            </Link>
                          </div>
                          {!isCompleted && (
                            <button
                              type="button"
                              className="btn btn-primary btn-small"
                              onClick={() => handleCompleteTopic(topic.id)}
                            >
                              Mark as Complete
                            </button>
                          )}
                        </>
                      ) : (
                        <p className="locked-msg">Locked. Complete the previous topic to unlock.</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

export default CourseRoadmapPage
