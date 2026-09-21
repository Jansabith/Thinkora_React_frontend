import { BookOpen, CircleHelp, FileText, Hand, Layers, MessageCircleQuestion, Plus, ShieldCheck, UserPlus, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import ActivityFeed from '../../components/ActivityFeed'
import Alert from '../../components/Alert'
import Avatar from '../../components/Avatar'
import BrandLogo from '../../components/BrandLogo'
import ChartLegend from '../../components/charts/ChartLegend'
import DonutChart from '../../components/charts/DonutChart'
import StudentGrowthPanel from '../../components/charts/StudentGrowthPanel'
import LeaderboardPanel from '../../components/LeaderboardPanel'
import LoadError from '../../components/LoadError'
import Loading from '../../components/Loading'
import MountainScene from '../../components/MountainScene'
import Panel from '../../components/Panel'
import PanelLink from '../../components/PanelLink'
import StatTile from '../../components/StatTile'
import TasksWidget from '../../components/TasksWidget'
import { useApiData } from '../../hooks/useApiData'
import { useAuth } from '../../hooks/useAuth'
import { approveStudent, rejectStudent } from '../../services/adminService'
import { getAdminDashboard } from '../../services/dashboardService'
import { BRAND, getQuoteOfTheDay } from '../../utils/brand'
import { formatDate, formatLongDate, getFullName } from '../../utils/format'

// Categories keep a fixed colour order; the tail is folded into "Other" by Django.
const CATEGORY_COLORS = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)']

function describeMonth(stat, showPercent = false) {
  if (stat.new_this_month === 0) {
    return { text: 'No new this month', flat: true }
  }
  if (showPercent && stat.growth_percent !== null) {
    return { text: `+${stat.growth_percent}% from last month` }
  }
  return { text: `+${stat.new_this_month} new this month` }
}

function getQuickActions(user, data) {
  const actions = []
  if (user.can_manage_content) {
    actions.push(
      { to: '/admin/courses?new=1', label: 'Create new course', icon: Plus },
      { to: '/admin/topics?new=1', label: 'Add new topic', icon: Layers },
      { to: '/admin/questions?new=1', label: 'Add new question', icon: FileText },
    )
  }
  if (user.can_manage_students) {
    actions.push(
      { to: '/admin/students', label: 'Manage students', icon: Users },
      { to: '/admin/requests', label: 'View student requests', icon: UserPlus, badge: data.pending_requests },
      { to: '/admin/doubts', label: 'Answer doubts', icon: MessageCircleQuestion, badge: data.open_doubts },
    )
  }
  if (user.role === 'main_admin') {
    actions.push({ to: '/main-admin/admins/new', label: 'Create admin', icon: ShieldCheck })
  }
  return actions
}

function AdminDashboardPage() {
  const { user } = useAuth()
  const { data, error, isLoading, reload } = useApiData(getAdminDashboard, { keepPreviousData: true })
  const [message, setMessage] = useState(null)
  const [busyStudentId, setBusyStudentId] = useState(null)

  if (isLoading && !data) {
    return <Loading message="Loading dashboard..." />
  }
  if (error && !data) {
    return <LoadError error={error} onRetry={reload} />
  }

  async function handleDecision(student, approve) {
    setMessage(null)
    setBusyStudentId(student.id)
    try {
      if (approve) {
        await approveStudent(student.id)
        setMessage({ type: 'success', text: `${getFullName(student)} was approved and can now log in.` })
      } else {
        await rejectStudent(student.id)
        setMessage({ type: 'info', text: `The request from ${getFullName(student)} was rejected.` })
      }
      reload()
    } catch (actionError) {
      setMessage({ type: 'error', text: actionError.message })
    } finally {
      setBusyStudentId(null)
    }
  }

  const { stats, content_overview: contentOverview } = data
  const categorySegments = contentOverview.categories.map((category, index) => ({
    key: category.name,
    label: category.name,
    value: category.count,
    color: category.name === 'Other' ? 'var(--series-other)' : CATEGORY_COLORS[index] ?? 'var(--series-other)',
  }))
  const quickActions = getQuickActions(user, data)

  return (
    <>
      <header className="welcome-header">
        <div>
          <h1>
            Welcome back, {user.first_name || user.username} <Hand className="wave" size={30} aria-hidden="true" />
          </h1>
          <p>Here&apos;s what is happening on {BRAND.name} today.</p>
        </div>
        <div className="welcome-aside">
          <span>{formatLongDate()}</span>
          <p className="welcome-quote">“{getQuoteOfTheDay(1)}”</p>
        </div>
      </header>

      {message && <Alert type={message.type}>{message.text}</Alert>}

      <div className="stat-tiles">
        <StatTile tinted icon={Users} tone="blue" value={stats.students.total} label="Total students" delta={describeMonth(stats.students, true)} />
        <StatTile tinted icon={BookOpen} tone="green" value={stats.courses.total} label="Total courses" delta={describeMonth(stats.courses)} />
        <StatTile tinted icon={Layers} tone="violet" value={stats.topics.total} label="Total topics" delta={describeMonth(stats.topics)} />
        <StatTile tinted icon={CircleHelp} tone="amber" value={stats.questions.total} label="Total questions" delta={describeMonth(stats.questions)} />
      </div>

      <div className="dashboard-row dashboard-row-2-1">
        <StudentGrowthPanel initialPoints={data.student_growth} />

        {/* The same board students see, so admins can spot who is active this week. */}
        <LeaderboardPanel fullPageLink="/admin/leaderboard" />
      </div>

      <div className="dashboard-row dashboard-row-2-1">
        <Panel title="Content Overview" subtitle="Courses by category">
          <div className="donut-with-legend">
            <DonutChart
              segments={categorySegments}
              centerValue={contentOverview.total_courses}
              centerLabel="Courses"
              ariaLabel="Courses by category"
            />
            <ChartLegend
              vertical
              items={contentOverview.categories.map((category, index) => ({
                key: category.name,
                label: category.name,
                color: categorySegments[index].color,
                value: category.count,
                detail: `(${category.percent}%)`,
              }))}
            />
          </div>
        </Panel>

        <Panel title="Quick Actions">
          <div className="quick-actions">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link key={action.to} to={action.to} className={`quick-action ${index === 0 ? 'quick-action-primary' : ''}`}>
                  <Icon size={18} aria-hidden="true" />
                  {action.label}
                  {action.badge > 0 && <span className="sidebar-badge">{action.badge}</span>}
                </Link>
              )
            })}
          </div>
        </Panel>
      </div>

      <div className="dashboard-row dashboard-row-1-1-1">
        {user.can_manage_students ? (
          <Panel title="Recent Student Requests" action={<PanelLink to="/admin/requests">View all</PanelLink>}>
            {data.recent_requests.length === 0 ? (
              <p className="muted">No pending requests. You are all caught up!</p>
            ) : (
              <div className="table-wrapper table-flat">
                <table className="compact-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Requested</th>
                      <th>
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_requests.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <Link to={`/admin/students/${student.id}`} className="person-cell" style={{ color: 'inherit', textDecoration: 'none' }}>
                            <Avatar name={getFullName(student)} size={32} color={student.avatar_color} icon={student.avatar_icon} />
                            <span>
                              <strong>{getFullName(student)}</strong>
                              <span className="cell-sub">{student.email}</span>
                            </span>
                          </Link>
                        </td>
                        <td>{formatDate(student.date_joined)}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="btn btn-success btn-small"
                              disabled={busyStudentId === student.id}
                              onClick={() => handleDecision(student, true)}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-small"
                              disabled={busyStudentId === student.id}
                              onClick={() => handleDecision(student, false)}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        ) : (
          <Panel title="Student requests">
            <p className="muted">Your account cannot manage students. Ask the Main Admin if you need this.</p>
          </Panel>
        )}

        <Panel title="Recent Activity" action={<PanelLink to="/admin/activity">View all</PanelLink>}>
          <ActivityFeed logs={data.recent_activity} emptyText="Changes by admins and new student requests appear here." />
        </Panel>

        <TasksWidget title="To-Do List" placeholder="Add a to-do, e.g. Review feedback" />
      </div>

      <section className="promo-banner wide-banner">
        <MountainScene variant="dusk" stars />
        <p className="quote-text">“A better learning world starts here.”</p>
        <BrandLogo to="/admin" />
      </section>
    </>
  )
}

export default AdminDashboardPage
