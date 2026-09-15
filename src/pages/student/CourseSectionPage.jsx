import { useCallback } from 'react'
import { Link, useParams } from 'react-router'
import DifficultyCounts from '../../components/DifficultyCounts'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import ProgressBar from '../../components/ProgressBar'
import { useApiData } from '../../hooks/useApiData'
import { getCourse, getTopics } from '../../services/courseService'
import { getMyCourseProgress } from '../../services/progressService'
import { pluralize } from '../../utils/format'
import { findSection } from '../../utils/sections'
import NotFoundPage from '../NotFoundPage'

const NO_TOPIC_PROGRESS = { done_count: 0, open_doubt_count: 0 }

// One section of a course (for example Practice Questions): choose a topic.
function CourseSectionPage() {
  const { courseId, sectionKey } = useParams()
  const section = findSection(sectionKey)
  const isQuestionsSection = sectionKey === 'questions'

  const loadData = useCallback(async () => {
    // All requests run at the same time. Done / doubt numbers only exist for practice questions.
    const [course, topics, progress] = await Promise.all([
      getCourse(courseId),
      getTopics(courseId),
      isQuestionsSection ? getMyCourseProgress(courseId) : Promise.resolve(null),
    ])
    return { course, topics, progress }
  }, [courseId, isQuestionsSection])

  const { data, error, isLoading, reload } = useApiData(loadData)

  if (!section) {
    return <NotFoundPage />
  }
  if (isLoading) {
    return <Loading message="Loading topics..." />
  }
  if (error) {
    return <LoadError error={error} onRetry={reload} />
  }

  const { course, progress } = data
  // Only show topics that have something in this section.
  const topics = data.topics.filter((topic) => topic[section.countField] > 0)

  return (
    <>
      <PageHeader
        title={`${course.title}: ${section.title}`}
        subtitle="Choose a topic."
        backTo={`/student/courses/${course.id}`}
        backLabel={course.title}
      />

      {topics.length === 0 ? (
        <p className="empty-state">Nothing has been added to this section yet. Please check back later.</p>
      ) : (
        <ol className="topic-list">
          {topics.map((topic, index) => {
            const topicProgress = progress?.topics[topic.id] ?? NO_TOPIC_PROGRESS
            return (
              <li key={topic.id}>
                <Link to={`/student/topics/${topic.id}/${section.key}`} className="topic-list-item">
                  <span className="topic-number">{index + 1}</span>
                  <span className="topic-info">
                    <span className="topic-title">{topic.title}</span>
                    {topic.description && <span className="cell-sub">{topic.description}</span>}
                  </span>
                  {isQuestionsSection ? (
                    <span className="topic-progress">
                      <DifficultyCounts topic={topic} />
                      <span className="topic-progress-row">
                        {topicProgress.open_doubt_count > 0 && (
                          <span className="badge badge-open">{pluralize(topicProgress.open_doubt_count, 'open doubt')}</span>
                        )}
                        <ProgressBar value={topicProgress.done_count} max={topic.question_count} label={`${topic.title} progress`} />
                      </span>
                    </span>
                  ) : (
                    <span className="card-meta">{pluralize(topic[section.countField], section.itemName)}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ol>
      )}
    </>
  )
}

export default CourseSectionPage
