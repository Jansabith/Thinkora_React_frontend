import { useCallback } from 'react'
import { Link, useParams } from 'react-router'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import ProgressBar from '../../components/ProgressBar'
import { useApiData } from '../../hooks/useApiData'
import { getCourse } from '../../services/courseService'
import { getMyCourseProgress } from '../../services/progressService'
import { pluralize } from '../../utils/format'
import { COURSE_SECTIONS } from '../../utils/sections'

// Course page: choose a section (Practice Questions, Videos, ...).
function CourseDetailPage() {
  // useParams() reads :courseId from the URL /student/courses/:courseId
  const { courseId } = useParams()

  const loadCourse = useCallback(async () => {
    const [course, progress] = await Promise.all([getCourse(courseId), getMyCourseProgress(courseId)])
    return { course, progress }
  }, [courseId])

  const { data, error, isLoading, reload } = useApiData(loadCourse)

  if (isLoading) {
    return <Loading message="Loading course..." />
  }
  if (error) {
    return <LoadError error={error} onRetry={reload} />
  }

  const { course, progress } = data

  return (
    <>
      <PageHeader title={course.title} subtitle={course.description} backTo="/student" backLabel="All courses" />

      <h2 className="section-title">Choose a section</h2>
      <div className="card-grid">
        {COURSE_SECTIONS.map((section) => (
          <Link key={section.key} to={`/student/courses/${course.id}/${section.key}`} className="card card-link section-card">
            <h3>{section.title}</h3>
            <p>{section.description}</p>
            <span className="card-meta">{pluralize(course[section.countField], section.itemName)}</span>
            {section.key === 'questions' && course.question_count > 0 && (
              <ProgressBar value={progress.done_count} max={course.question_count} label="Practice questions done" />
            )}
          </Link>
        ))}
      </div>
    </>
  )
}

export default CourseDetailPage
