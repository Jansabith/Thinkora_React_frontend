import { CircleCheck, Clock, MessageCircleQuestion, Users } from 'lucide-react'
import { Link } from 'react-router'
import Avatar from '../../components/Avatar'
import BarChart from '../../components/charts/BarChart'
import ChartPanel from '../../components/charts/ChartPanel'
import StudentGrowthPanel from '../../components/charts/StudentGrowthPanel'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import PageHeader from '../../components/PageHeader'
import Panel from '../../components/Panel'
import ProgressBar from '../../components/ProgressBar'
import StatTile from '../../components/StatTile'
import StatusBadge from '../../components/StatusBadge'
import { useApiData } from '../../hooks/useApiData'
import { getReports } from '../../services/dashboardService'

const WEEKLY_SERIES = [
  { key: 'done', label: 'Questions done', color: 'var(--series-1)' },
  { key: 'doubts', label: 'Doubts asked', color: 'var(--series-2)' },
]

function toWeeklyCategories(weeks) {
  return weeks.map((week) => {
    const monday = new Date(`${week.week_start}T00:00:00`)
    return {
      label: monday.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      fullLabel: `Week of ${monday.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}`,
      values: { done: week.questions_done, doubts: week.doubts_asked },
    }
  })
}

// Admin reports: growth, weekly activity, course completion, top students and doubts.
function ReportsPage() {
  const { data, error, isLoading, reload } = useApiData(getReports)

  if (isLoading) {
    return <Loading message="Loading reports..." />
  }
  if (error) {
    return <LoadError error={error} onRetry={reload} />
  }

  const growth = data.student_growth
  const totalStudents = growth.length ? growth[growth.length - 1].total_students : 0
  const weeklyCategories = toWeeklyCategories(data.weekly_activity)
  const replyHours = data.doubts.average_reply_hours

  return (
    <>
      <PageHeader title="Reports" subtitle="How students are growing, practising and getting help." backTo="/admin" backLabel="Dashboard" />

      <div className="stat-tiles">
        <StatTile icon={Users} tone="violet" value={totalStudents} label="Students" />
        <StatTile icon={MessageCircleQuestion} tone="amber" value={data.doubts.open} label="Open doubts" />
        <StatTile icon={CircleCheck} tone="green" value={data.doubts.answered} label="Answered doubts" />
        <StatTile icon={Clock} tone="blue" value={replyHours === null ? '—' : `${replyHours} h`} label="Average reply time" />
      </div>

      <div className="dashboard-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        <StudentGrowthPanel initialPoints={growth} />
        <ChartPanel
          title="Weekly Activity"
          subtitle="Last 8 weeks"
          chart={<BarChart categories={weeklyCategories} series={WEEKLY_SERIES} ariaLabel="Questions done and doubts asked per week" />}
          columns={[
            { key: 'fullLabel', label: 'Week' },
            { key: 'done', label: 'Questions done', numeric: true },
            { key: 'doubts', label: 'Doubts asked', numeric: true },
          ]}
          rows={weeklyCategories.map((category) => ({ fullLabel: category.fullLabel, ...category.values }))}
        />
      </div>

      <div className="dashboard-row dashboard-row-2-1">
        <Panel title="Course Completion" subtitle="Average progress of the students who started each course">
          <div className="table-wrapper table-flat">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th className="numeric">Questions</th>
                  <th className="numeric">Started</th>
                  <th className="numeric">Finished</th>
                  <th>Average progress</th>
                  <th className="numeric">Open doubts</th>
                </tr>
              </thead>
              <tbody>
                {data.course_completion.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <strong>{course.title}</strong>
                      <span className="cell-sub">
                        {course.category || 'Uncategorized'} {!course.is_published && <StatusBadge status="draft" />}
                      </span>
                    </td>
                    <td className="numeric">{course.question_count}</td>
                    <td className="numeric">{course.students_started}</td>
                    <td className="numeric">{course.students_completed}</td>
                    <td>
                      <ProgressBar value={course.average_progress} max={100} label={`${course.title} average progress`} showPercent />
                    </td>
                    <td className="numeric">{course.open_doubts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Top Students" subtitle="Most questions done">
          {data.top_students.length === 0 ? (
            <p className="muted">No questions have been marked as done yet.</p>
          ) : (
            <ol className="ranked-list">
              {data.top_students.map((student, index) => (
                <li key={student.id}>
                  <span className="ranked-number">{index + 1}</span>
                  <Avatar name={student.name} size={34} />
                  <Link to={`/admin/students/${student.id}`} className="ranked-name">
                    {student.name}
                    <span className="cell-sub">@{student.username}</span>
                  </Link>
                  <strong>{student.done_count}</strong>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>
    </>
  )
}

export default ReportsPage
