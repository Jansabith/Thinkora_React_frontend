import { Check, Lock, PencilLine, PlayCircle, Trophy } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import Fireworks from '../../components/Fireworks'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import MountainScene from '../../components/MountainScene'
import PageHeader from '../../components/PageHeader'
import ProgressBar from '../../components/ProgressBar'
import { useApiData } from '../../hooks/useApiData'
import { apiRequest } from '../../services/api'
import { getCourse, getTopics } from '../../services/courseService'
import './roadmap.css'

// Draws a smooth curve from one marker to the next.
// The two control points sit directly above and below the midpoint, which gives
// a gentle S-bend instead of a straight line.
function buildSegment(from, to) {
  const bend = Math.abs(to.y - from.y) * 0.42
  return `M ${from.x} ${from.y} C ${from.x} ${from.y + bend}, ${to.x} ${to.y - bend}, ${to.x} ${to.y}`
}

// The trail is drawn behind the cards, through the middle of every marker.
// Marker positions are MEASURED after layout, so cards of different heights
// (a long syllabus list, a short description) always line up perfectly.
function RoadmapTrail({ markerRefs, containerRef, topics, redrawKey }) {
  const [points, setPoints] = useState([])
  const [size, setSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) {
      return undefined
    }

    const measure = () => {
      const box = container.getBoundingClientRect()
      setSize({ width: box.width, height: box.height })
      setPoints(
        markerRefs.current.slice(0, topics.length).map((marker) => {
          if (!marker) {
            return null
          }
          const markerBox = marker.getBoundingClientRect()
          return {
            x: markerBox.left - box.left + markerBox.width / 2,
            y: markerBox.top - box.top + markerBox.height / 2,
          }
        }),
      )
    }

    measure()
    // Re-measure whenever anything resizes: the window, the sidebar, a growing card.
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [containerRef, markerRefs, topics.length, redrawKey])

  if (points.length < 2 || !size.height) {
    return null
  }

  return (
    <svg
      className="roadmap-trail"
      width={size.width}
      height={size.height}
      viewBox={`0 0 ${size.width} ${size.height}`}
      aria-hidden="true"
      focusable="false"
    >
      {points.slice(0, -1).map((from, index) => {
        const to = points[index + 1]
        if (!from || !to) {
          return null
        }
        // A segment counts as walked once the topic it leads AWAY from is finished.
        const isWalked = topics[index].is_completed
        return (
          <path
            key={topics[index].id}
            className={`roadmap-trail-segment ${isWalked ? 'is-walked' : ''}`}
            d={buildSegment(from, to)}
          />
        )
      })}
    </svg>
  )
}

function CourseRoadmapPage() {
  const { courseId } = useParams()
  const containerRef = useRef(null)
  const markerRefs = useRef([])
  const [celebrating, setCelebrating] = useState(false)
  const [busyTopicId, setBusyTopicId] = useState(null)
  const [actionError, setActionError] = useState('')

  const loadData = useCallback(async () => {
    const [course, topics] = await Promise.all([getCourse(courseId), getTopics(courseId)])
    return { course, topics }
  }, [courseId])

  const { data, error, isLoading, reload } = useApiData(loadData)

  // Stop the fireworks by themselves, so they never stay on screen.
  useEffect(() => {
    if (!celebrating) {
      return undefined
    }
    const timer = setTimeout(() => setCelebrating(false), 4200)
    return () => clearTimeout(timer)
  }, [celebrating])

  async function handleCompleteTopic(topicId) {
    setActionError('')
    setBusyTopicId(topicId)
    try {
      await apiRequest(`/progress/topics/${topicId}/complete/`, { method: 'POST' })
      setCelebrating(true)
      reload()
    } catch (completeError) {
      setActionError(completeError.message)
    } finally {
      setBusyTopicId(null)
    }
  }

  if (isLoading) {
    return <Loading message="Loading your roadmap..." variant="roadmap" count={4} />
  }
  if (error) {
    return <LoadError error={error} onRetry={reload} />
  }

  const { course, topics } = data
  const completedCount = topics.filter((topic) => topic.is_completed).length
  const isCourseFinished = topics.length > 0 && completedCount === topics.length
  // Where the student is right now: the first topic they can open but have not finished.
  const currentTopic = topics.find((topic) => !topic.is_completed && !topic.is_locked)

  return (
    <>
      <PageHeader
        title={`${course.title} Roadmap`}
        subtitle="Climb one topic at a time. Finish a topic to unlock the next step."
        backTo={`/student/courses/${course.id}`}
        backLabel={course.title}
      />

      {celebrating && (
        <span className="roadmap-celebration">
          <Fireworks />
        </span>
      )}

      <section className="roadmap-hero">
        <span className="roadmap-hero-scene" aria-hidden="true">
          <MountainScene variant={isCourseFinished ? 'dawn' : 'dusk'} stars={!isCourseFinished} />
        </span>
        <div className="roadmap-hero-content">
          <p className="roadmap-hero-eyebrow">Your climb</p>
          <p className="roadmap-hero-count">
            <strong>{completedCount}</strong> of {topics.length} topics
          </p>
          <ProgressBar value={completedCount} max={topics.length} label="Topics completed" showPercent />
          <p className="roadmap-hero-note">
            {isCourseFinished
              ? 'You reached the summit. Every topic in this course is complete.'
              : currentTopic
                ? `Next up: ${currentTopic.title}`
                : 'Start with the first topic below.'}
          </p>
        </div>
      </section>

      {actionError && <p className="roadmap-error">{actionError}</p>}

      {topics.length === 0 ? (
        <p className="empty-state">No topics in this course yet.</p>
      ) : (
        <div className="roadmap" ref={containerRef}>
          <RoadmapTrail
            containerRef={containerRef}
            markerRefs={markerRefs}
            topics={topics}
            redrawKey={`${completedCount}-${topics.length}`}
          />

          <ol className="roadmap-steps">
            {topics.map((topic, index) => {
              const isCompleted = topic.is_completed
              const isLocked = topic.is_locked && !isCompleted
              const isCurrent = currentTopic?.id === topic.id
              const state = isCompleted ? 'is-done' : isLocked ? 'is-locked' : 'is-open'

              return (
                <li key={topic.id} className={`roadmap-step ${state} ${isCurrent ? 'is-current' : ''}`}>
                  <span
                    className="roadmap-marker"
                    ref={(element) => {
                      markerRefs.current[index] = element
                    }}
                  >
                    {isCompleted ? (
                      <Check size={24} strokeWidth={3} aria-hidden="true" />
                    ) : isLocked ? (
                      <Lock size={20} aria-hidden="true" />
                    ) : (
                      <span className="roadmap-marker-number">{index + 1}</span>
                    )}
                  </span>

                  <article className="roadmap-card">
                    <header className="roadmap-card-head">
                      <h3>{topic.title}</h3>
                      {isCurrent && <span className="roadmap-tag">You are here</span>}
                      {isCompleted && <span className="roadmap-tag roadmap-tag-done">Completed</span>}
                    </header>

                    <p className="roadmap-card-text">
                      {topic.description || 'Work through this topic to move forward.'}
                    </p>

                    {Array.isArray(topic.syllabus_points) && topic.syllabus_points.length > 0 && (
                      <ul className="roadmap-syllabus">
                        {topic.syllabus_points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    )}

                    {isLocked ? (
                      <p className="roadmap-locked-note">
                        <Lock size={14} aria-hidden="true" />
                        Finish the previous topic to unlock this one.
                      </p>
                    ) : (
                      <div className="roadmap-actions">
                        <Link to={`/student/topics/${topic.id}/videos`} className="btn btn-secondary btn-small">
                          <PlayCircle size={15} aria-hidden="true" /> Videos
                        </Link>
                        <Link to={`/student/topics/${topic.id}/questions`} className="btn btn-secondary btn-small">
                          <PencilLine size={15} aria-hidden="true" /> Practice
                          {topic.question_count > 0 && <span className="roadmap-count">{topic.question_count}</span>}
                        </Link>
                        {!isCompleted && (
                          <button
                            type="button"
                            className="btn btn-primary btn-small"
                            onClick={() => handleCompleteTopic(topic.id)}
                            disabled={busyTopicId === topic.id}
                          >
                            <Trophy size={15} aria-hidden="true" />
                            {busyTopicId === topic.id ? 'Saving...' : 'Mark complete'}
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </>
  )
}

export default CourseRoadmapPage
