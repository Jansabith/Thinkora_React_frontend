import { Video } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link } from 'react-router'
import CourseIcon from '../../components/CourseIcon'
import DifficultyCounts from '../../components/DifficultyCounts'
import FormField from '../../components/FormField'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import ProgressBar from '../../components/ProgressBar'
import { useApiData } from '../../hooks/useApiData'
import { getAllTopics, getCourses } from '../../services/courseService'
import { getMyOverview } from '../../services/progressService'

// Every topic of every course in one place, grouped by course.
function AllTopicsPage() {
  const [courseId, setCourseId] = useState('')
  const [search, setSearch] = useState('')

  const loadData = useCallback(async () => {
    const [topics, courses, overview] = await Promise.all([getAllTopics(), getCourses(), getMyOverview()])
    return { topics, courses, overview }
  }, [])
  const { data, error, isLoading, reload } = useApiData(loadData)

  if (isLoading) {
    return <Loading message="Loading topics..." variant="cards" count={6} />
  }
  if (error) {
    return <LoadError error={error} onRetry={reload} />
  }

  const doneByTopic = {}
  for (const course of data.overview.courses) {
    for (const topic of course.topics) {
      doneByTopic[topic.id] = topic.done_count
    }
  }

  const searchText = search.trim().toLowerCase()
  const topics = data.topics.filter(
    (topic) => (!courseId || String(topic.course) === courseId) && topic.title.toLowerCase().includes(searchText),
  )
  const courses = data.courses.filter((course) => topics.some((topic) => topic.course === course.id))

  return (
    <>
      <PageHeader title="All Topics" subtitle="Jump straight to any topic in any course." />

      <div className="filters-row">
        <FormField label="Course" htmlFor="topics-course">
          <select id="topics-course" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
            <option value="">All courses</option>
            {data.courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Search" htmlFor="topics-search">
          <input id="topics-search" type="search" placeholder="Topic name" value={search} onChange={(event) => setSearch(event.target.value)} />
        </FormField>
      </div>

      {courses.length === 0 && <p className="empty-state">No topics match these filters.</p>}

      {courses.map((course) => (
        <section key={course.id}>
          <h2 className="topic-group-title">
            <CourseIcon course={course} size={32} /> {course.title}
          </h2>
          <ol className="topic-list">
            {topics
              .filter((topic) => topic.course === course.id)
              .map((topic) => (
                <li key={topic.id}>
                  <div className="topic-list-item">
                    <span className="topic-number">{topic.order}</span>
                    <span className="topic-info">
                      <Link to={`/student/topics/${topic.id}/questions`} className="topic-title">
                        {topic.title}
                      </Link>
                      {topic.description && <span className="cell-sub">{topic.description}</span>}
                    </span>
                    <span className="topic-progress">
                      <DifficultyCounts topic={topic} />
                      <span className="topic-progress-row">
                        {topic.video_count > 0 && (
                          <Link to={`/student/topics/${topic.id}/videos`} className="badge badge-neutral">
                            <Video size={12} aria-hidden="true" /> {topic.video_count}
                          </Link>
                        )}
                        {topic.question_count > 0 && (
                          <ProgressBar value={doneByTopic[topic.id] ?? 0} max={topic.question_count} label={`${topic.title} progress`} />
                        )}
                      </span>
                    </span>
                  </div>
                </li>
              ))}
          </ol>
        </section>
      ))}
    </>
  )
}

export default AllTopicsPage
