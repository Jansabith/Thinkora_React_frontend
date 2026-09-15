import { ChartColumn, CircleCheck, MessageCircleQuestion, PencilLine } from 'lucide-react'
import { Link } from 'react-router'
import ActivityCalendar from '../../components/ActivityCalendar'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import Panel from '../../components/Panel'
import ProgressBar from '../../components/ProgressBar'
import StatTile from '../../components/StatTile'
import { useApiData } from '../../hooks/useApiData'
import { getMyOverview } from '../../services/progressService'
import { percent } from '../../utils/format'
import { getLevelLabel } from '../../utils/levels'

// The student's progress in every course and topic.
function MyProgressPage() {
  const { data, error, isLoading, reload } = useApiData(getMyOverview)

  if (isLoading) {
    return <Loading message="Loading your progress..." />
  }
  if (error) {
    return <LoadError error={error} onRetry={reload} />
  }

  const { summary, courses } = data

  return (
    <>
      <PageHeader title="My Progress" subtitle="Everything you have finished, and what is left to do." />

      <div className="stat-tiles">
        <StatTile icon={PencilLine} tone="violet" value={`${summary.done_count}/${summary.question_count}`} label="Questions done" />
        <StatTile icon={ChartColumn} tone="amber" value={`${percent(summary.done_count, summary.question_count)}%`} label="Overall progress" />
        <StatTile icon={MessageCircleQuestion} tone="blue" value={summary.open_doubt_count} label="Open doubts" />
        <StatTile icon={CircleCheck} tone="green" value={summary.resolved_doubt_count} label="Answered doubts" />
      </div>

      <div className="dashboard-row dashboard-row-2-1">
        <div className="stacked">
          {courses.length === 0 && <p className="empty-state">There are no practice questions yet.</p>}
          {courses.map((course) => (
            <Panel
              key={course.id}
              title={course.title}
              subtitle={`${course.category || 'Course'} · ${getLevelLabel(course.level)}`}
              action={<ProgressBar value={course.done_count} max={course.question_count} label={`${course.title} progress`} showPercent />}
            >
              <div className="table-wrapper table-flat">
                <table>
                  <thead>
                    <tr>
                      <th>Topic</th>
                      <th>Done</th>
                      <th className="numeric">Open doubts</th>
                      <th>
                        <span className="sr-only">Open</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.topics.map((topic) => (
                      <tr key={topic.id}>
                        <td>{topic.title}</td>
                        <td>
                          <ProgressBar value={topic.done_count} max={topic.question_count} label={`${topic.title} progress`} />
                        </td>
                        <td className="numeric">{topic.open_doubt_count}</td>
                        <td>
                          <Link to={`/student/topics/${topic.id}/questions`} className="btn btn-secondary btn-small">
                            Practise
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          ))}
        </div>

        <div className="stacked">
          <Panel>
            <ActivityCalendar />
          </Panel>
        </div>
      </div>
    </>
  )
}

export default MyProgressPage
