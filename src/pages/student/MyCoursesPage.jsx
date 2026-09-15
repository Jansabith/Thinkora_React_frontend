import { ArrowRight } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link } from 'react-router'
import CourseIcon from '../../components/CourseIcon'
import FilterTabs from '../../components/FilterTabs'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import ProgressBar from '../../components/ProgressBar'
import StatusBadge from '../../components/StatusBadge'
import { useApiData } from '../../hooks/useApiData'
import { getCourses } from '../../services/courseService'
import { getMyOverview } from '../../services/progressService'
import { pluralize } from '../../utils/format'

// Every course the student can open, with their progress.
function MyCoursesPage() {
  const loadData = useCallback(async () => {
    const [courses, overview] = await Promise.all([getCourses(), getMyOverview()])
    return { courses, overview }
  }, [])
  const { data, error, isLoading, reload } = useApiData(loadData)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')

  if (isLoading) {
    return <Loading message="Loading courses..." />
  }
  if (error) {
    return <LoadError error={error} onRetry={reload} />
  }

  const progressByCourse = Object.fromEntries(data.overview.courses.map((course) => [course.id, course]))
  const categories = [...new Set(data.courses.map((course) => course.category).filter(Boolean))].sort()
  const searchText = search.trim().toLowerCase()
  const courses = data.courses.filter(
    (course) => (!category || course.category === category) && course.title.toLowerCase().includes(searchText),
  )

  return (
    <>
      <PageHeader title="My Courses" subtitle="Pick a course and continue where you left off." />

      <div className="toolbar">
        {categories.length > 0 && (
          <FilterTabs
            options={[{ value: '', label: 'All' }, ...categories.map((name) => ({ value: name, label: name }))]}
            value={category}
            onChange={setCategory}
            label="Filter by category"
          />
        )}
        <input
          type="search"
          className="compact-search"
          placeholder="Search courses"
          aria-label="Search courses"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{ maxWidth: 260 }}
        />
      </div>

      {courses.length === 0 && <p className="empty-state">No courses match. Try another category or search.</p>}

      <div className="course-cards">
        {courses.map((course) => {
          const progress = progressByCourse[course.id]
          const doneCount = progress?.done_count ?? 0
          return (
            <article key={course.id} className="course-card">
              <div className="course-card-top">
                <CourseIcon course={course} />
                <div>
                  <h3>{course.title}</h3>
                  <p className="course-card-description">{course.description || 'No description yet.'}</p>
                </div>
              </div>
              <div className="difficulty-counts">
                {course.category && <span className="badge badge-neutral">{course.category}</span>}
                <StatusBadge status={course.level} />
              </div>
              {course.question_count > 0 && (
                <ProgressBar value={doneCount} max={course.question_count} label={`${course.title} progress`} showPercent />
              )}
              <div className="course-card-footer">
                <span className="card-meta">
                  {pluralize(course.topic_count, 'topic')} · {pluralize(course.question_count, 'question')}
                </span>
                <Link to={`/student/courses/${course.id}`} className="btn btn-primary btn-small">
                  {doneCount === 0 ? 'Start' : doneCount >= course.question_count ? 'Review' : 'Continue'}{' '}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}

export default MyCoursesPage
